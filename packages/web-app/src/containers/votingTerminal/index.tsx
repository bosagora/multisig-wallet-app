// import {VoteValues} from '@aragon/sdk-client';
// import {ProposalStatus} from '@aragon/sdk-client-common';
import {
  ButtonGroup,
  ButtonText,
  CheckboxListItem,
  IconClock,
  IconInfo,
  IconRadioCancel,
  Option,
  SearchInput,
  VotersTable,
  VoterType,
} from '@aragon/ui-components';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {shortenAddress} from 'utils/library';
import BreakdownTab from './breakdownTab';
import InfoTab from './infoTab';
import {ProposalStatus} from '../../utils/aragon/sdk-client-common-types';
import {VoteValues} from '../../utils/aragon/sdk-client-multisig-types';
import {useAccount} from 'wagmi';

export type ProposalVoteResults = {
  yes: {value: string | number; percentage: number};
  no: {value: string | number; percentage: number};
  abstain: {value: string | number; percentage: number};
};

export type TerminalTabs = 'voters' | 'breakdown' | 'info';

// TODO: clean up props: some shouldn't be optional;
// also, make more generic and group props based on proposal type
export type VotingTerminalProps = {
  breakdownTabDisabled?: boolean;
  votersTabDisabled?: boolean;
  voteNowDisabled?: boolean;
  startDate?: string;
  endDate?: string;
  preciseEndDate?: string;
  minApproval?: number;
  minParticipation?: string;
  currentParticipation?: string;
  missingParticipation?: number;
  supportThreshold?: number;
  voters?: Array<VoterType>;
  status?: ProposalStatus;
  statusLabel: string;
  strategy?: string;
  token?: {
    symbol: string;
    name: string;
  };
  results?: ProposalVoteResults;
  approvals?: string[];
  votingInProcess?: boolean;
  voteOptions?: string;
  onVoteClicked?: React.MouseEventHandler<HTMLButtonElement>;
  onVoteSubmitClicked?: (vote: VoteValues) => void;
  onCancelClicked?: React.MouseEventHandler<HTMLButtonElement>;
  voteButtonLabel?: string;
  alertMessage?: string;
  selectedTab?: TerminalTabs;
  onTabSelected?: React.Dispatch<React.SetStateAction<TerminalTabs>>;
  isMember?: boolean;
};

export const VotingTerminal: React.FC<VotingTerminalProps> = ({
  breakdownTabDisabled = false,
  votersTabDisabled = false,
  voteNowDisabled = false,
  currentParticipation,
  minApproval,
  minParticipation,
  missingParticipation = 0,
  supportThreshold,
  voters = [],
  // results,
  approvals,
  // token,
  startDate,
  endDate,
  preciseEndDate,
  status,
  statusLabel,
  strategy,
  voteOptions = '',
  onVoteClicked,
  votingInProcess,
  onCancelClicked,
  onVoteSubmitClicked,
  voteButtonLabel,
  alertMessage,
  selectedTab = 'info',
  onTabSelected,
  isMember,
}) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [selectedVote, setSelectedVote] = useState<VoteValues>(VoteValues.YES);
  const {t} = useTranslation();

  const {address} = useAccount();
  const displayedVoters = useMemo(() => {
    return query === ''
      ? voters
      : voters.filter(voter => voter.wallet.includes(query.toLowerCase()));
  }, [query, voters]);

  const minimumReached = useMemo(() => {
    if (approvals && minApproval) {
      return approvals.length >= minApproval;
    } else {
      return missingParticipation === 0;
    }
  }, [approvals, minApproval, missingParticipation]);

  const missingApprovalOrParticipation = useMemo(() => {
    if (approvals && minApproval) {
      return minimumReached ? 0 : minApproval - approvals.length;
    } else {
      return missingParticipation;
    }
  }, [approvals, minApproval, minimumReached, missingParticipation]);

  return (
    <Container>
      <Header>
        <Heading1>{t('votingTerminal.title')}</Heading1>
        <ButtonGroup
          bgWhite
          defaultValue={selectedTab}
          value={selectedTab}
          onChange={(value: string) => onTabSelected?.(value as TerminalTabs)}
        >
          <Option
            value="breakdown"
            label={t('votingTerminal.breakdown')}
            disabled={breakdownTabDisabled}
          />
          <Option
            value="voters"
            label={t('votingTerminal.voters')}
            disabled={votersTabDisabled}
          />
          <Option value="info" label={t('votingTerminal.info')} />
        </ButtonGroup>
      </Header>

      {selectedTab === 'breakdown' ? (
        <BreakdownTab
          approvals={approvals}
          memberCount={voters.length}
          // results={results}
          // token={token}
        />
      ) : selectedTab === 'voters' ? (
        <VotersTabContainer>
          <SearchInput
            placeholder={t('votingTerminal.inputPlaceholder')}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value.trim())
            }
          />
          {displayedVoters.length !== 0 ? (
            <VotersTable
              voters={displayedVoters}
              showOption
              page={page}
              showVotingPower={false}
              showAmount={false}
              onLoadMore={() => setPage(prev => prev + 1)}
            />
          ) : (
            <StateEmpty
              type="Object"
              mode="inline"
              object="magnifying_glass"
              title={t(
                query === ''
                  ? 'votingTerminal.emptyState.title'
                  : 'votingTerminal.emptyState.titleSearch',
                {
                  query: shortenAddress(query),
                }
              )}
              description={
                query === '' ? '' : t('votingTerminal.emptyState.subtitle')
              }
            />
          )}
        </VotersTabContainer>
      ) : (
        <InfoTab
          currentParticipation={currentParticipation}
          currentApprovals={approvals?.length}
          endDate={endDate}
          preciseEndDate={preciseEndDate}
          memberCount={voters.length}
          minApproval={minApproval}
          minimumReached={minimumReached}
          minParticipation={minParticipation}
          missingApprovalOrParticipation={missingApprovalOrParticipation}
          startDate={startDate}
          status={status}
          strategy={strategy}
          supportThreshold={supportThreshold}
          uniqueVoters={undefined}
          voteOptions={voteOptions}
        />
      )}

      {votingInProcess ? (
        <VotingContainer>
          <CheckboxContainer className="hidden">
            <CheckboxListItem
              label={t('votingTerminal.yes')}
              helptext={t('votingTerminal.yesHelptext')}
              onClick={() => setSelectedVote(VoteValues.YES)}
              type={selectedVote === VoteValues.YES ? 'active' : 'default'}
            />
            <CheckboxListItem
              label={t('votingTerminal.no')}
              helptext={t('votingTerminal.noHelptext')}
              onClick={() => setSelectedVote(VoteValues.NO)}
              type={selectedVote === VoteValues.NO ? 'active' : 'default'}
            />
            <CheckboxListItem
              label={t('votingTerminal.abstain')}
              helptext={t('votingTerminal.abstainHelptext')}
              onClick={() => setSelectedVote(VoteValues.ABSTAIN)}
              type={selectedVote === VoteValues.ABSTAIN ? 'active' : 'default'}
            />
          </CheckboxContainer>

          <VoteContainer>
            <ButtonWrapper>
              <ButtonText
                css={{}}
                // label={t('votingTerminal.submit')}
                label="Approve"
                size="large"
                disabled={!selectedVote}
                onClick={() => {
                  if (selectedVote && onVoteSubmitClicked)
                    onVoteSubmitClicked(selectedVote);
                }}
              />
            </ButtonWrapper>
          </VoteContainer>
        </VotingContainer>
      ) : (
        status && (
          <>
            <VoteContainer>
              <ButtonText
                css={{}}
                label={
                  isMember
                    ? approvals?.includes(address || '')
                      ? 'Approved'
                      : 'Executed'
                    : status === ProposalStatus.EXECUTED
                    ? 'Concluded'
                    : 'Member Only'
                }
                size="large"
                onClick={() => {
                  onVoteClicked && onVoteClicked();
                }}
                className="w-full tablet:w-max"
                disabled={voteNowDisabled}
              />
            </VoteContainer>
          </>
        )
      )}
    </Container>
  );
};

type StatusProp = {
  status?: ProposalStatus;
};

const StatusIcon: React.FC<StatusProp> = ({status}) => {
  if (status === 'Pending' || status === 'Active') {
    return <IconClock className="text-info-500" />;
  } else if (status === 'Defeated') {
    return <IconRadioCancel className="text-critical-500" />;
  } else {
    return <IconInfo className="text-info-500" />;
  }
};

const Container = styled.div.attrs({
  className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0 border border-ui-100',
})``;

const Header = styled.div.attrs({
  className:
    'tablet:flex tablet:justify-between tablet:items-center space-y-2 tablet:space-y-0',
})``;

const Heading1 = styled.h1.attrs({
  className: 'ft-text-xl font-bold text-ui-800 flex-grow',
})``;

const VotingContainer = styled.div.attrs({
  className: 'mt-6 tablet:mt-5',
})``;

const Heading2 = styled.h2.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const CheckboxContainer = styled.div.attrs({
  className: 'mt-3 space-y-1.5',
})``;

const VoteContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row tablet:justify-between tablet:space-x-3 items-center tablet:items-center mt-3 space-y-2 tablet:space-y-0' as string,
})``;

const ButtonWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-2 space-x-0 tablet:space-y-0 tablet:space-x-2 w-full tablet:w-max',
})``;

const VotersTabContainer = styled.div.attrs({
  className: 'mt-3 desktop:mt-5 space-y-2',
})``;
