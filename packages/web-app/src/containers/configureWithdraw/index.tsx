// import {useApolloClient} from '@apollo/client';
import {
  AlertInline,
  DropdownInput,
  Label,
  ValueInput,
  InputValue as WalletInputValue,
} from '@aragon/ui-components';
import React, {useCallback, useEffect} from 'react';
import {
  Controller,
  FormState,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useWallet} from 'hooks/useWallet';
import {WithdrawAction} from 'pages/newWithdraw';
// import {fetchTokenData} from 'services/prices';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address, handleClipboardActions, toDisplayEns} from 'utils/library';
import {fetchBalance, getTokenInfo, isNativeToken} from 'utils/tokens';
import {ActionIndex} from 'utils/types';
import {
  validateTokenAddress,
  validateTokenAmount,
  validateWeb3Address,
} from 'utils/validators';
import {add} from 'date-fns';
import {stripPlgnAdrFromProposalId} from '../../utils/proposals';

type ConfigureWithdrawFormProps = ActionIndex; //extend if necessary

const ConfigureWithdrawForm: React.FC<ConfigureWithdrawFormProps> = ({
  actionIndex,
}) => {
  const {t} = useTranslation();
  // const client = useApolloClient();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {infura: provider} = useProviders();
  const {setSelectedActionIndex} = useActionsContext();
  const {alert} = useAlertContext();

  const {data: daoDetails} = useDaoDetailsQuery();

  const {control, getValues, trigger, resetField, setFocus, setValue} =
    useFormContext();

  const {errors, dirtyFields} = useFormState({control});
  const [name, from, tokenAddress, isCustomToken, tokenBalance, tokenSymbol] =
    useWatch({
      name: [
        `actions.${actionIndex}.name`,
        `actions.${actionIndex}.from`,
        `actions.${actionIndex}.tokenAddress`,
        `actions.${actionIndex}.isCustomToken`,
        `actions.${actionIndex}.tokenBalance`,
        `actions.${actionIndex}.tokenSymbol`,
      ],
    });
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (isCustomToken) setFocus(`actions.${actionIndex}.tokenAddress`);

    if (from === '' && daoDetails?.address) {
      setValue(`actions.${actionIndex}.from`, daoDetails?.address);
    }
  }, [
    address,
    daoDetails?.address,
    from,
    actionIndex,
    isCustomToken,
    setFocus,
    setValue,
    nativeCurrency,
  ]);

  useEffect(() => {
    if (!name) {
      setValue(`actions.${actionIndex}.name`, 'withdraw_assets');
    }
  }, [actionIndex, name, setValue]);

  // Fetch custom token information
  useEffect(() => {
    if (!address || !isCustomToken || !tokenAddress) return;

    const fetchTokenInfo = async () => {
      if (errors.tokenAddress !== undefined) {
        if (dirtyFields.amount)
          trigger([
            `actions.${actionIndex}.amount`,
            `actions.${actionIndex}.tokenSymbol`,
          ]);
        return;
      }

      try {
        // fetch token balance and token metadata
        const allTokenInfoPromise = Promise.all([
          isNativeToken(tokenAddress)
            ? provider.getBalance(daoDetails?.address as string)
            : fetchBalance(
                tokenAddress,
                daoDetails?.address as string,
                provider,
                nativeCurrency
              ),
          // fetchTokenData(tokenAddress, client, network, tokenSymbol),
          getTokenInfo(tokenAddress, provider, nativeCurrency),
        ]);

        const [balance, apiData, chainData] = await allTokenInfoPromise;
        if (apiData) {
          setValue(`actions.${actionIndex}.tokenName`, apiData.name);
          setValue(`actions.${actionIndex}.tokenSymbol`, apiData.symbol);
          setValue(`actions.${actionIndex}.tokenImgUrl`, apiData.imgUrl);
          setValue(`actions.${actionIndex}.tokenPrice`, apiData.price);
        }

        if (!apiData && chainData) {
          setValue(`actions.${actionIndex}.tokenName`, chainData.name);
          setValue(`actions.${actionIndex}.tokenSymbol`, chainData.symbol);
        }

        setValue(
          `actions.${actionIndex}.tokenDecimals`,
          Number(chainData.decimals)
        );
        setValue(`actions.${actionIndex}.tokenBalance`, balance);
      } catch (error) {
        /**
         * Error is intentionally swallowed. Passing invalid address will
         * return error, but should not be thrown.
         * Also, double safeguard. Should not actually fall into here since
         * tokenAddress should be valid in the first place for balance to be fetched.
         */
        console.error(error);
      }
      if (dirtyFields.amount)
        trigger([
          `actions.${actionIndex}.amount`,
          `actions.${actionIndex}.tokenSymbol`,
        ]);
    };

    if (daoDetails?.address) {
      fetchTokenInfo();
    }
  }, [
    address,
    dirtyFields.amount,
    errors.tokenAddress,
    actionIndex,
    isCustomToken,
    provider,
    setValue,
    tokenAddress,
    trigger,
    // client,
    network,
    daoDetails?.address,
    nativeCurrency,
    tokenSymbol,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const renderWarning = useCallback(
    (value: string) => {
      // Insufficient data to calculate warning
      if (!tokenBalance || value === '') return null;

      if (Number(value) > Number(tokenBalance))
        return (
          <AlertInline label={t('warnings.amountGtDaoToken')} mode="warning" />
        );
    },
    [tokenBalance, t]
  );

  // add maximum amount to amount field
  const handleMaxClicked = useCallback(
    (onChange: React.ChangeEventHandler<HTMLInputElement>) => {
      if (tokenBalance) {
        onChange(tokenBalance);
        alert(t('alert.chip.max'));
      }
    },
    [alert, t, tokenBalance]
  );

  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it
      if (value) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, t]
  );

  /*************************************************
   *                Field Validators               *
   *************************************************/
  const addressValidator = useCallback(
    async (address: string) => {
      if (isNativeToken(address)) return true;

      const validationResult = await validateTokenAddress(address, provider);

      // address invalid, reset token fields
      if (validationResult !== true) {
        resetField(`actions.${actionIndex}.tokenName`);
        resetField(`actions.${actionIndex}.tokenImgUrl`);
        resetField(`actions.${actionIndex}.tokenSymbol`);
        resetField(`actions.${actionIndex}.tokenBalance`);
      } else {
        const tokenStorage = localStorage.getItem('LOCAL_TOKENS');
        const chainId = provider.network.chainId;

        const value =
          tokenStorage && tokenStorage[chainId]
            ? JSON.parse(tokenStorage[chainId])
            : [];
        const newTokens = {
          [chainId]: value.some(
            (a: string) => a.toLowerCase() === address.toLowerCase()
          )
            ? value
            : [...value, address],
        };
        const ret = JSON.stringify(newTokens);
        console.log('tokenStorage > newTokens :', ret);
        localStorage.setItem('LOCAL_TOKENS', ret);
      }

      return validationResult;
    },
    [actionIndex, provider, resetField]
  );

  const amountValidator = useCallback(
    async (amount: string) => {
      const tokenAddress = getValues(`actions.${actionIndex}.tokenAddress`);

      // check if a token is selected using its address
      if (tokenAddress === '') return t('errors.noTokenSelected');

      // check if token selected is valid
      if (errors.tokenAddress) return t('errors.amountWithInvalidToken');

      try {
        const {decimals} = await getTokenInfo(
          tokenAddress,
          provider,
          nativeCurrency
        );

        // run amount rules
        return validateTokenAmount(amount, decimals);
      } catch (error) {
        // catches miscellaneous cases such as not being able to get token decimal
        console.error('Error validating amount', error);
        return t('errors.defaultAmountValidationError');
      }
    },
    [errors.tokenAddress, getValues, actionIndex, provider, t, nativeCurrency]
  );

  const recipientValidator = useCallback(
    async (value: WalletInputValue) => {
      const recipient = new Web3Address(provider, value.address, value.ensName);

      // withdrawing to DAO
      if (
        recipient.address === daoDetails?.address ||
        recipient.ensName === toDisplayEns(daoDetails?.ensDomain)
      )
        return 'Cant withdraw to your own address';

      return validateWeb3Address(recipient, t('errors.required.recipient'), t);
    },
    [daoDetails?.address, daoDetails?.ensDomain, provider, t]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {/* Recipient (to) */}
      <FormItem>
        <Label
          label={t('labels.recipient')}
          helpText={t('newWithdraw.configureWithdraw.toSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.to`}
          control={control}
          defaultValue={{address: '', ensName: ''}}
          rules={{validate: recipientValidator}}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <WrappedWalletInput
              name={name}
              state={error && 'critical'}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
      </FormItem>

      {/* Select token */}
      <FormItem>
        <Label
          label={t('labels.token')}
          helpText={t('newWithdraw.configureWithdraw.tokenSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.tokenSymbol`}
          control={control}
          defaultValue=""
          rules={{required: t('errors.required.token')}}
          render={({field: {name, value}, fieldState: {error}}) => (
            <>
              <DropdownInput
                name={name}
                mode={error ? 'critical' : 'default'}
                value={value}
                onClick={() => {
                  setSelectedActionIndex(actionIndex);
                  open('token');
                }}
                placeholder={t('placeHolders.selectToken')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Custom token address */}
      {isCustomToken && (
        <FormItem>
          <Label
            label={t('labels.address')}
            helpText={t('newDeposit.contractAddressSubtitle')}
          />
          <Controller
            name={`actions.${actionIndex}.tokenAddress`}
            control={control}
            defaultValue=""
            rules={{
              required: t('errors.required.tokenAddress'),
              validate: addressValidator,
            }}
            render={({
              field: {name, onBlur, onChange, value, ref},
              fieldState: {error},
            }) => (
              <>
                <ValueInput
                  mode={error ? 'critical' : 'default'}
                  ref={ref}
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  adornmentText={value ? t('labels.clear') : t('labels.paste')}
                  onAdornmentClick={() => handleAdornmentClick(value, onChange)}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}

      {/* Token amount */}
      <FormItem>
        <Label
          label={t('labels.amount')}
          helpText={t('newWithdraw.configureWithdraw.amountSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.amount`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.amount'),
            validate: amountValidator,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <StyledInput
                mode={error ? 'critical' : 'default'}
                name={name}
                type="number"
                value={value}
                placeholder="0"
                onBlur={onBlur}
                onChange={onChange}
                adornmentText={t('labels.max')}
                onAdornmentClick={() => handleMaxClicked(onChange)}
              />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                  {renderWarning(value)}
                </div>
                {tokenBalance && (
                  <TokenBalance>
                    {`${t(
                      'labels.maxBalance'
                    )}: ${tokenBalance} ${tokenSymbol}`}
                  </TokenBalance>
                )}
              </div>
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureWithdrawForm;

/**
 * Check if the screen is valid
 * @param dirtyFields List of fields that have been changed
 * @param errors List of fields that have errors
 * @param tokenAddress Token address
 * @returns Whether the screen is valid
 */
export function isValid(
  dirtyFields?: FormState<WithdrawAction>['dirtyFields'],
  errors?: FormState<WithdrawAction>['errors'],
  tokenAddress?: string
) {
  // check if fields are dirty
  if (!dirtyFields?.to || !dirtyFields?.amount || !tokenAddress) return false;

  // check if fields have errors
  if (errors?.to || errors?.amount || errors?.tokenAddress) return false;

  return true;
}

/*************************************************
 *               Styled Components               *
 *************************************************/

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-1 text-xs text-right text-ui-600',
})``;

const StyledInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
