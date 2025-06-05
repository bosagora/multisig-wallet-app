import {useTranslation} from 'react-i18next';

import {ActionParameter, HookData} from 'utils/types';
import {useMSWalletQuery} from './useMSWalletDetails';

export function useMSWalletActions(dao: string): HookData<ActionParameter[]> {
  const {error, isLoading} = useMSWalletQuery(dao);
  const multisig = true;

  const {t} = useTranslation();

  const baseActions: ActionParameter[] = [
    {
      type: 'withdraw_assets',
      title: t('TransferModal.item2Title'),
      subtitle: t('AddActionModal.withdrawAssetsSubtitle'),
      isReuseable: true,
    },
    {
      type: 'wallet_connect_modal',
      title: t('AddActionModal.connectdAppsTitle'),
      subtitle: t('AddActionModal.connectdAppsSubtitle'),
      isReuseable: true,
    },
    {
      type: 'external_contract_modal',
      title: t('AddActionModal.externalContract'),
      subtitle: t('AddActionModal.externalContractSubtitle'),
      isReuseable: true,
    },
  ];

  const multisigActions = [
    {
      type: 'add_address',
      title: t('AddActionModal.addAddresses'),
      subtitle: t('AddActionModal.addAddressesSubtitle'),
    },
    {
      type: 'remove_address',
      title: t('AddActionModal.removeAddresses'),
      subtitle: t('AddActionModal.removeAddressesSubtitle'),
    },
  ].concat(baseActions) as ActionParameter[];

  // const tokenVotingActions = showMintOption
  //   ? ([
  //       {
  //         type: 'mint_tokens',
  //         title: t('AddActionModal.mintTokens'),
  //         subtitle: t('AddActionModal.mintTokensSubtitle'),
  //       },
  //     ].concat(baseActions) as ActionParameter[])
  //   : baseActions;
  //
  return {
    data: multisig ? multisigActions : multisigActions,
    isLoading,
    error: error as Error,
  };
}
