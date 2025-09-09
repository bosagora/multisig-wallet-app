/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */
import {ModeType, ProgressStatusProps} from 'msw-ui-components';
import {format} from 'date-fns';
import {TFunction} from 'react-i18next';
import {
  Action,
  DetailedProposal,
  ProposalListItem,
  SupportedProposals,
} from 'utils/types';
import {
  CreateMajorityVotingProposalParams,
  PluginTypes,
  ProposalMetadata,
  ProposalStatus,
} from 'utils/aragon/types';
import {getFormattedUtcOffset, KNOWN_FORMATS} from './date';

export function isMultisigProposal(
  proposal: SupportedProposals | undefined
): proposal is DetailedProposal {
  if (!proposal) return false;
  return 'approvals' in proposal;
}

/**
 * Get proposal status steps
 * @param status proposal status
 * @param endDate proposal voting end date
 * @param creationDate proposal creation date
 * @param publishedBlock block number
 * @param executionDate proposal execution date
 * @returns list of status steps based on proposal status
 */
export function getProposalStatusSteps(
  t: TFunction,
  status: ProposalStatus,
  pluginType: PluginTypes,
  startDate: Date,
  endDate: Date,
  creationDate: Date,
  publishedBlock: string,
  executionFailed: boolean,
  executionBlock?: string,
  executionDate?: Date
): Array<ProgressStatusProps> {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return [
        {...getActiveProposalStep(t, startDate, 'active')},
      ];
    case ProposalStatus.EXECUTED:
      if (executionDate)
        return [
          {
            label: t('governance.statusWidget.executed'),
            mode: 'succeeded',
            date: `${format(
              executionDate,
              KNOWN_FORMATS.proposals
            )}  ${getFormattedUtcOffset()}`,
            block: executionBlock,
          },
        ];
      else
        return [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock
          ),
          {label: t('governance.statusWidget.failed'), mode: 'failed'},
        ];

    // Pending by default
    default:
      return [{...getPublishedProposalStep(t, creationDate, publishedBlock)}];
  }
}

function getEndedProposalSteps(
  t: TFunction,
  creationDate: Date,
  startDate: Date,
  endDate: Date,
  block: string,
  executionDate?: Date
): Array<ProgressStatusProps> {
  return [
    {...getPublishedProposalStep(t, creationDate, block)},
    {...getActiveProposalStep(t, startDate, 'done')},
    {
      label: t('governance.statusWidget.succeeded'),
      mode: 'done',
      date: `${format(
        executionDate! < endDate ? executionDate! : endDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    },
  ];
}

function getPublishedProposalStep(
  t: TFunction,
  creationDate: Date,
  block: string | undefined
): ProgressStatusProps {
  return {
    label: t('governance.statusWidget.published'),
    date: `${format(
      creationDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
    mode: 'done',
    ...(block && {block}),
  };
}

function getActiveProposalStep(t: TFunction, startDate: Date, mode: ModeType) {
  return {
    label: t('governance.statusWidget.active'),
    mode,
    date: `${format(
      startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
  };
}

export type CacheProposalParams = {
  creatorAddress: string;
  msWalletAddress: string;
  walletName: string;
  metadata: ProposalMetadata;
  proposalParams: CreateMajorityVotingProposalParams;
  proposalGuid: string;

  // Multisig props
  minApprovals?: number;
  onlyListed?: boolean;
};
//
/**
 * Map newly created proposal to Detailed proposal that can be cached and shown
 * @param params necessary parameters to map newly created proposal to augmented DetailedProposal
 * @returns Detailed proposal, ready for caching and displaying
 */
export function mapToCacheProposal(params: CacheProposalParams) {
  // common properties
  const commonProps = {
    actions: params.proposalParams.actions || [],
    creationDate: new Date(),
    creatorAddress: params.creatorAddress,
    msWallet: {address: params.msWalletAddress, name: params.walletName},
    endDate: params.proposalParams.endDate!,
    startDate: params.proposalParams.startDate!,
    id: params.proposalGuid,
    metadata: params.metadata,
  };

  // multisig
  return {
    ...commonProps,
    approvals: [],
    minApprovals: params.minApprovals,
    executionTxHash: '',
    settings: {
      minApprovals: params.minApprovals,
      onlyListed: params.onlyListed,
    },
  };
}

/**
 * Strips proposal id of plugin address
 * @param proposalId id with following format:  *0x4206cdbc...a675cae35_0x0*
 * @returns proposal id without the pluginAddress
 * or the given proposal id if already stripped of the plugin address: *0x3*
 */
export function stripPlgnAdrFromProposalId(proposalId: string) {
  // return the "pure" contract proposal id or consider given proposal already stripped
  return proposalId?.split('_')[1] || proposalId;
}

export function getVoteStatus(proposal: DetailedProposal, t: TFunction) {
  let label = '';

  switch (proposal.status) {
    case 'Active':
      {
        label = t('votingTerminal.status.active');
      }
      break;
    case 'Executed':
      label = t('votingTerminal.status.executed');

      break;
  }
  return label;
}

export function getVoteButtonLabel(
  proposal: DetailedProposal,
  canVoteOrApprove: boolean,
  votedOrApproved: boolean,
  t: TFunction
) {
  let label = '';

  if (isMultisigProposal(proposal)) {
    label = votedOrApproved
      ? t('votingTerminal.status.approved')
      : t('votingTerminal.concluded');

    // if (proposal.status === 'Pending') label = t('votingTerminal.approve');
    // else
    if (proposal.status === 'Active' && !votedOrApproved)
      label = t('votingTerminal.approve');
  }

  return label;
}

export function getProposalExecutionStatus(
  proposalStatus: ProposalStatus | undefined,
  canExecuteEarly: boolean,
  executionFailed: boolean
) {
  switch (proposalStatus) {
    // case 'Succeeded':
    //   return executionFailed ? 'executable-failed' : 'executable';
    case 'Executed':
      return 'executed';
    // case 'Defeated':
    //   return 'defeated';
    case 'Active':
      return canExecuteEarly ? 'executable' : 'default';
    // case 'Pending':
    default:
      return 'default';
  }
}

/**
 * Filter out all empty add/remove address and minimul approval actions
 * @param actions supported actions
 * @param minApprovals
 * @returns list of non empty address
 */
export function getNonEmptyActions(
  actions: Array<Action>,
  minApprovals?: number
) {
  return actions.flatMap(action => {
    if (action.name === 'add_address') {
      // strip empty inputs off

      const finalAction = {
        ...action,
        inputs: {
          memberWallets: action.inputs.memberWallets.filter(
            item => !!item.address
          ),
        },
      };

      return finalAction.inputs.memberWallets.length > 0 ? finalAction : [];
    } else if (action.name === 'remove_address') {
      // address removed from the list: return action or don't include
      return action.inputs.memberWallets.length > 0 ? action : [];
    } else {
      // all other actions can go through
      return action;
    }
  });
}

/**
 * Recalculates the status of a proposal.
 * @template T - A type that extends DetailedProposal or ProposalListItem
 * @param proposal - The proposal to recalculate the status of
 * @returns The proposal with recalculated status,
 * or null/undefined if the input was null/undefined
 */
export function recalculateStatus<
  T extends DetailedProposal | ProposalListItem
>(proposal: T | null | undefined): T | null | undefined {
  if (proposal?.executed === false) {
    // const endTime = proposal.endDate.getTime();
    // // prioritize active state over succeeded one if end time has yet
    // // to be met
    // if (endTime >= Date.now())q
    return {...proposal, status: ProposalStatus.ACTIVE};

    // for an inactive multisig proposal, make sure a vote has actually been cast
    // or that the end time isn't in the past
    // if (isMultisigProposal(proposal)) {
    //   if (endTime < Date.now() || proposal.approvals.length === 0)
    //     return {...proposal, status: ProposalStatus.DEFEATED};
    // }
  }
  return proposal ? {...proposal, status: ProposalStatus.EXECUTED} : null;
}
