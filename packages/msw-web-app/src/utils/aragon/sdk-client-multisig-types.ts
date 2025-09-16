import {ProposalBase} from './sdk-client-common-types';
import {DaoAction, Pagination, ProposalStatus} from './sdk-client-common-types';
/**
 * Contains the states of a proposal. Note that on chain
 * proposals cannot be in draft state
 */
export enum VoteValues {
  // NONE = 0,
  ABSTAIN = 1,
  YES = 2,
  NO = 3,
}

// TYPES

export type MajorityVotingSettingsBase = {
  /** Float between 0 and 1 */
  supportThreshold: number;
  /** Float between 0 and 1 */
  minParticipation: number;
};

export type MajorityVotingSettings = MajorityVotingSettingsBase & {
  /* default is standard */
  votingMode?: VotingMode;
  /* minimum is 3600 */
  minDuration: number;
  /* default is 0 */
  minProposerVotingPower?: bigint;
};

export type VotingSettings = MajorityVotingSettings;

export enum VotingMode {
  STANDARD = 'Standard',
  EARLY_EXECUTION = 'EarlyExecution',
  VOTE_REPLACEMENT = 'VoteReplacement',
}

export type CreateProposalBaseParams = {
  pluginAddress: string;
  actions?: DaoAction[];
  /** For every action item, denotes whether its execution could fail
   * without aborting the whole proposal execution */
  failSafeActions?: Array<boolean>;
  metadataUri: string;
};

export type CreateMajorityVotingProposalParams = CreateProposalBaseParams & {
  startDate?: Date;
  endDate?: Date;
  executeOnPass?: boolean;
  creatorVote?: VoteValues;
};

export type VoteProposalParams = {
  vote: VoteValues;
  proposalId: string;
};

// STEPS

export type MultisigVotingSettings = {
  minApprovals: number;
  onlyListed: boolean;
};

/* Proposal */

export type MultisigProposalListItem = ProposalBase & {
  approval: string[];
  settings: MultisigVotingSettings;
};

export type MultisigProposal = ProposalBase & {
  approval: string[];
  settings: MultisigVotingSettings;
};
