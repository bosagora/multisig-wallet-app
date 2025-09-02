import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Loading} from 'components/temporary';
import {ActionsProvider} from 'context/actions';
import {CreateProposalProvider} from 'context/createProposal';
import {useMSWalletDetailsQuery} from 'hooks/useMSWalletDetails';
import {InputValue} from 'msw-ui-components';

export type TokenFormData = {
  tokenName: string;
  tokenSymbol: string;
  tokenImgUrl: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenBalance: string;
  tokenPrice?: number;
  isCustomToken: boolean;
};

export type WithdrawAction = TokenFormData & {
  to: InputValue;
  from: string;
  amount: string;
  name: string; // This indicates the type of action; Deposit is NOT an action
};

type WithdrawFormData = {
  actions: WithdrawAction[];

  // Proposal data
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  startUtc: string;
  endUtc: string;
  durationSwitch: string;
  proposalTitle: string;
  proposalSummary: string;
  proposal: unknown;
  links: unknown;
};

export const defaultValues = {
  links: [{name: '', url: ''}],
  startSwitch: 'now',
  durationSwitch: 'duration',
  actions: [],
};

const NewWithdraw: React.FC = () => {
  const [showTxModal, setShowTxModal] = useState(false);

  const {data: walletDetails, isLoading: detailsLoading} =
    useMSWalletDetailsQuery();
  // const {data: pluginSettings, isLoading: settingsLoading} = usePluginSettings(
  //   walletDetails?.plugins[0].instanceAddress as string,
  //   walletDetails?.plugins[0].id as PluginTypes
  // );
  //
  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (!walletDetails || detailsLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <ActionsProvider daoId={walletDetails?.address as string}>
          <CreateProposalProvider
            showTxModal={showTxModal}
            setShowTxModal={setShowTxModal}
          >
            {/*<WithdrawStepper*/}
            {/*  walletDetails={walletDetails}*/}
            {/*  pluginSettings={pluginSettings}*/}
            {/*  enableTxModal={() => setShowTxModal(true)}*/}
            {/*/>*/}
          </CreateProposalProvider>
        </ActionsProvider>
      </FormProvider>
    </>
  );
};

export default withTransaction('NewWithdraw', 'component')(NewWithdraw);
