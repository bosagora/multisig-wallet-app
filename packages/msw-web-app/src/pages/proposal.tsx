// import {useApolloClient} from '@apollo/client';
// import {
//   // MultisigClient,
//   // MultisigProposal,
//   // TokenVotingClient,
//   // TokenVotingProposal,
//   // VoteValues,
//   // VotingMode,
// } from '@aragon/sdk-client';
import {VoteValues} from '../utils/aragon/sdk-client-multisig-types';
import {ProposalStatus} from 'utils/aragon/sdk-client-common-types';
import {
  Breadcrumb,
  ButtonText,
  IconChevronUp,
  IconGovernance,
  Link,
  VoterType,
  WidgetStatus,
} from 'msw-ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import {Loading} from 'components/temporary';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useSpecificProvider} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useMSWalletDetailsQuery} from 'hooks/useMSWalletDetails';
import {useMSWalletMembers} from '../hooks/useMSWalletMembers';
import {useMSWalletProposal} from '../hooks/useMSWalletProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {shortenAddress} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  getProposalExecutionStatus,
  getProposalStatusSteps,
  getVoteButtonLabel,
  getVoteStatus,
  stripPlgnAdrFromProposalId,
} from 'utils/proposals';
import {
  Action,
  ActionWithdraw,
  DetailedProposal,
  ProposalId,
  WithdrawProposal,
} from 'utils/types';
import {PluginTypes} from '../utils/aragon/types';
import {format} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../utils/date';
import {useWalletCanVote} from '../hooks/useWalletCanVote';
import {useLoadTokenLogoURL} from '../hooks/useMSWalletBalances';

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const navigate = useNavigate();

  const {msWallet, id: urlId} = useParams();
  const proposalId = useMemo(
    () => (urlId ? new ProposalId(urlId) : undefined),
    [urlId]
  );
  const {getImgUrl} = useLoadTokenLogoURL();

  const {data: walletDetails, isLoading: detailsAreLoading} =
    useMSWalletDetailsQuery();
  const {
    data: {members: daoMembers},
  } = useMSWalletMembers(
    walletDetails?.address || '',
    'multisig.plugin.wallet.eth'
  );

  const {data: mswSettings} = usePluginSettings(
    walletDetails?.address as string
  );
  const multisigDAO = true;

  const allowVoteReplacement = false;

  const {client} = useClient();
  const {set, get} = useCache();

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [voteStatus, setVoteStatus] = useState('');
  const [intervalInMills, setIntervalInMills] = useState(0);
  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();

  const {
    handleSubmitVote,
    handleExecuteProposal,
    isLoading: paramsAreLoading,
    pluginType,
    voteSubmitted,
    executionFailed,
    transactionHash,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = useMSWalletProposal(
    walletDetails?.address as string,
    proposalId!,
    intervalInMills
  );

  const {data: canVote} = useWalletCanVote(
    address,
    daoMembers,
    proposal?.approval,
    proposal?.executed
  );
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // voting
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);

  /*************************************************
   *                     Hooks                     *
   *************************************************/

  useEffect(() => {
    if (proposal?.status) {
      setTerminalTab(
        proposal.status === ProposalStatus.EXECUTED ? 'breakdown' : 'info'
      );
    }
  }, [proposal?.status]);

  // decode proposal actions
  useEffect(() => {
    if (!proposal) return;
    console.log(proposal);

    const withdrawAction = {
      amount: proposal.amount,
      name: 'withdraw_assets',
      to: {address: proposal.to || ''},
      tokenBalance: 0,
      tokenAddress: proposal.tokenAddress,
      tokenImgUrl: getImgUrl(proposal.tokenSymbol, walletDetails?.chain || 1),
      tokenName: proposal.tokenName,
      tokenPrice: 0,
      tokenSymbol: proposal.tokenSymbol,
      tokenDecimals: proposal.tokenDecimals,
      isCustomToken: false,
    } as unknown as ActionWithdraw;

    // );
    setDecodedActions([withdrawAction]);
  }, [client, walletDetails?.chain, getImgUrl, network, proposal, provider, t]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.status]);

  // handle can vote and wallet connection status
  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      // reset ref
      statusRef.current.wasNotLoggedIn = false;

      // logged out technically wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // throw network modal
      if (isOnWrongNetwork) {
        open('network');
      }
    }
  }, [isConnected, isOnWrongNetwork, open, getImgUrl]);

  useEffect(() => {
    if (isOnWrongNetwork || !isConnected || !canVote) {
      setVotingInProcess(false);
    } else {
      setVotingInProcess(true);
    }
    // was on the wrong network but now on the right one
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      // reset ref
      statusRef.current.wasOnWrongNetwork = false;

      // show voting in process
      if (canVote) {
        console.log('set vip true');
        setVotingInProcess(true);
      }
    }
  }, [
    canVote,
    isConnected,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

  useEffect(() => {
    if (proposal) {
      // set the very first time
      setVoteStatus(getVoteStatus(proposal, t));
    }
  }, [proposal, t]);

  /*************************************************
   *              Handlers and Callbacks           *
   *************************************************/
  // terminal props
  const mappedProps = useMemo(() => {
    if (proposal && daoMembers) {
      return {
        approvals: proposal.approval,
        minApproval: proposal.settings.minApprovals,
        voters: [
          ...daoMembers.map(m => {
            return {
              wallet: m.address,
              option: proposal.approval.some(
                a =>
                  // remove the call to strip plugin address when sdk returns proper plugin address
                  stripPlgnAdrFromProposalId(a).toLowerCase() ===
                  m.address.toLowerCase()
              )
                ? 'approved'
                : 'none',
            } as VoterType;
          }),
        ],
        isMember: (address &&
          daoMembers.some(
            a =>
              // remove the call to strip plugin address when sdk returns proper plugin address
              stripPlgnAdrFromProposalId(a.address).toLowerCase() ===
              address.toLowerCase()
          )) as boolean,
        strategy: t('votingTerminal.multisig'),
        voteOptions: t('votingTerminal.approve'),
        startDate: `${format(
          new Date(),
          KNOWN_FORMATS.proposals
        )}  ${getFormattedUtcOffset()}`,

        endDate: `${format(
          new Date(),
          KNOWN_FORMATS.proposals
        )}  ${getFormattedUtcOffset()}`,
      };
    }
  }, [address, daoMembers, proposal, t]);

  // get early execution status
  const canExecuteEarly = useMemo(
    () =>
      (proposal as WithdrawProposal)?.approval?.length >=
      mswSettings?.minApprovals,
    [mswSettings, proposal]
  );

  // proposal execution status
  const executionStatus = useMemo(
    () =>
      getProposalExecutionStatus(
        proposal?.status,
        canExecuteEarly,
        executionFailed
      ),
    [canExecuteEarly, executionFailed, proposal?.status]
  );

  // whether current user has voted
  const voted = useMemo(() => {
    if (!address || !proposal) return false;

    // if (isMultisigProposal(proposal)) {
    return proposal.approval.some(
      a =>
        // remove the call to strip plugin address when sdk returns proper plugin address
        stripPlgnAdrFromProposalId(a).toLowerCase() === address.toLowerCase()
    );
  }, [address, proposal]);

  // vote button and status
  const buttonLabel = useMemo(() => {
    if (proposal) {
      return getVoteButtonLabel(proposal, canVote, voted, t);
    }
  }, [proposal, voted, canVote, t]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    // disable voting on non-active proposals
    if (proposal?.status !== 'Active') return {voteNowDisabled: true};

    // disable approval on multisig when wallet has voted
    if (multisigDAO && (voted || voteSubmitted)) return {voteNowDisabled: true};

    // disable voting on mv with no vote replacement when wallet has voted
    if (!allowVoteReplacement && (voted || voteSubmitted))
      return {voteNowDisabled: true};

    // not logged in
    if (!address) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('wallet');
          statusRef.current.wasNotLoggedIn = true;
        },
      };
    }

    // wrong network
    else if (isOnWrongNetwork) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('network');
          statusRef.current.wasOnWrongNetwork = true;
        },
      };
    }

    // member, not yet voted
    else if (canVote) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          if (multisigDAO) {
            handleSubmitVote(VoteValues.YES);
          } else {
            setVotingInProcess(true);
          }
        },
      };
    } else return {voteNowDisabled: true};
  }, [
    address,
    allowVoteReplacement,
    canVote,
    handleSubmitVote,
    isOnWrongNetwork,
    multisigDAO,
    open,
    proposal?.status,
    voteSubmitted,
    voted,
  ]);

  // handler for execution
  const handleExecuteNowClicked = () => {
    if (!address) {
      open('wallet');
      statusRef.current.wasNotLoggedIn = true;
    } else if (isOnWrongNetwork) {
      open('network');
    } else {
      handleExecuteProposal();
    }
  };

  // alert message, only shown when not eligible to vote
  const alertMessage = useMemo(() => {
    if (
      proposal &&
      proposal.status === 'Active' && // active proposal
      address && // logged in
      !isOnWrongNetwork && // on proper network
      !voted && // haven't voted
      !canVote // cannot vote
    ) {
      return t('votingTerminal.status.ineligibleWhitelist');
    }
  }, [address, canVote, isOnWrongNetwork, proposal, t, voted]);

  // status steps for proposal
  const proposalSteps = useMemo(() => {
    if (proposal) {
      return getProposalStatusSteps(
        t,
        proposal.status,
        pluginType,
        new Date(proposal.createdTime.toNumber()),
        new Date(proposal.createdTime.toNumber()),
        new Date(proposal.createdTime.toNumber()),
        '',
        false,
        '',
        proposal.executed ? new Date() : undefined
      );
    } else return [];
  }, [proposal, t, pluginType, executionFailed]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (proposalError) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
  }

  if (paramsAreLoading || proposalIsLoading || detailsAreLoading || !proposal) {
    return <Loading />;
  }

  return (
    <Container>
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(
                generatePath(path, {
                  network,
                  msWallet: walletDetails?.address,
                })
              )
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{proposal?.title}</ProposalTitle>
        <ContentWrapper>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal?.creator.toLowerCase() === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal?.creator || '')
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creator}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal?.description}</SummaryText>
      </HeaderContainer>

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {proposal.description && expandedProposal && (
            <>
              <ButtonText
                css={{}}
                className="mt-3 w-full tablet:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          <VotingTerminal
            status={proposal.status}
            statusLabel={voteStatus}
            selectedTab={terminalTab}
            alertMessage={alertMessage}
            onTabSelected={setTerminalTab}
            onVoteClicked={onClick}
            onCancelClicked={() => setVotingInProcess(false)}
            voteButtonLabel={buttonLabel}
            voteNowDisabled={voteNowDisabled}
            votingInProcess={votingInProcess}
            onVoteSubmitClicked={vote => handleSubmitVote(vote, address || '')}
            approvals={mappedProps?.approvals}
            voters={mappedProps?.voters}
            isMember={mappedProps?.isMember}
            startDate={mappedProps?.startDate}
            endDate={mappedProps?.endDate}
            minApproval={mappedProps?.minApproval}
            strategy={mappedProps?.strategy}
            voteOptions={mappedProps?.voteOptions}
          />

          <ExecutionWidget
            pluginType={pluginType}
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteNowClicked}
            txhash={transactionHash || undefined}
          />
        </ProposalContainer>
        <AdditionalInfoContainer>
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

export default withTransaction('Proposal', 'component')(Proposal);

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-2 desktop:p-0 tablet:px-3 pt-2',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-bold text-ui-800 text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-x-3 gap-y-1.5',
})``;

const ProposerLink = styled.p.attrs({
  className: 'text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-2/5',
})``;

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs(
  ({expandedProposal}: ContentContainerProps) => ({
    className: `${
      expandedProposal ? 'tablet:mt-5' : 'tablet:mt-8'
    } mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0`,
  })
)<ContentContainerProps>``;
