import {CardProposal, CardProposalProps, Spinner} from '@aragon/ui-components';
// import {BigNumber} from 'ethers';
import React, {useMemo} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {NavigateFunction, generatePath, useNavigate} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {useMSWalletMembers} from '../../hooks/useMSWalletMembers';
import {
  CHAIN_METADATA,
  PROPOSAL_STATE_LABELS,
  SupportedNetworks,
} from 'utils/constants';
// import {translateProposalDate} from 'utils/date';
import {Proposal} from 'utils/paths';
// import {
//   TokenVotingOptions,
//   getErc20Results,
//   isErc20VotingProposal,
//   stripPlgnAdrFromProposalId,
// } from 'utils/proposals';
import {ProposalListItem} from 'utils/types';
import {MultisigProposalListItem, PluginTypes} from 'utils/aragon/types';
import {useWallet} from 'hooks/useWallet';
import {stripPlgnAdrFromProposalId} from '../../utils/proposals';
import {shortenAddress} from '../../utils/library';

type ProposalListProps = {
  proposals: Array<ProposalListItem>;
  multisigWalletAddress: string;
  isLoading?: boolean;
};

// type OptionResult = {
//   [K in TokenVotingOptions]: {
//     value: string | number;
//     percentage: number;
//     option: K;
//   };
// };

function isMultisigProposalListItem(
  proposal: ProposalListItem | undefined
): proposal is MultisigProposalListItem {
  if (!proposal) return false;
  return 'approval' in proposal;
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  multisigWalletAddress,
  isLoading,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {address} = useWallet();
  const navigate = useNavigate();

  const {data: members, isLoading: areMembersLoading} = useMSWalletMembers(
    multisigWalletAddress
  );

  const mappedProposals: ({id: string} & CardProposalProps)[] = useMemo(
    () =>
      proposals.map(p =>
        proposal2CardProps(
          p,
          members.members.length,
          network,
          navigate,
          t,
          multisigWalletAddress,
          address
        )
      ),
    [
      proposals,
      members.members.length,
      network,
      navigate,
      t,
      multisigWalletAddress,
      address,
    ]
  );

  if (isLoading || areMembersLoading) {
    return (
      <div className="flex justify-center items-center h-7">
        <Spinner size="default" />
      </div>
    );
  }

  if (mappedProposals.length === 0) {
    return (
      <div className="flex justify-center items-center h-7 text-gray-600">
        <p data-testid="proposalList">{t('governance.noProposals')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="proposalList">
      {mappedProposals.map(({id, ...p}) => (
        <CardProposal addressLabel={''} {...p} key={id} />
      ))}
    </div>
  );
};

function relativeVoteCount(optionCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }
  return Math.round((optionCount / totalCount) * 100);
}

export type CardViewProposal = Omit<CardProposalProps, 'onClick'> & {
  id: string;
};

/**
 * Map SDK proposals to proposals to be displayed as CardProposals
 * @param proposals proposal list from SDK
 * @param network supported network name
 * @returns list of proposals ready to be display as CardProposals
 */
export function proposal2CardProps(
  proposal: ProposalListItem,
  memberCount: number,
  network: SupportedNetworks,
  navigate: NavigateFunction,
  t: TFunction,
  multisigWalletAddress: string,
  address: string | null
): {id: string; addressLabel: string} & CardProposalProps {
  //console.log('proposal.id.toString() : ', proposal.id.toString());
  const props = {
    id: proposal.id.toString(),
    title: proposal.title,
    description: proposal.description,
    explorer: CHAIN_METADATA[network].explorer,
    publisherAddress: proposal.creator,
    publishLabel: t('governance.proposals.publishedBy'),
    addressLabel:
      proposal?.creator.toLowerCase() === address?.toLowerCase()
        ? t('labels.you')
        : shortenAddress(proposal?.creator || ''),
    process: proposal.status.toLowerCase() as CardProposalProps['process'],
    onClick: () => {
      // trackEvent('governance_viewProposal_clicked', {
      //   proposal_id: proposal.id.toString(),
      //   dao_address: proposal.msWallet.address,
      // });
      //console.log('clicked');
      navigate(
        generatePath(Proposal, {
          network,
          msWallet: multisigWalletAddress,
          id: proposal.id.toString(),
        })
      );
    },
  };

  const specificProps = {
    voteTitle: t('votingTerminal.approvedBy'),
    stateLabel: PROPOSAL_STATE_LABELS,
    alertMessage: 'alert message',
  };
  if (proposal.status.toLowerCase() === 'active') {
    const votedAlertLabel = proposal.approval?.some(
      v =>
        stripPlgnAdrFromProposalId(v).toLowerCase() === address?.toLowerCase()
    )
      ? t('governance.proposals.alert.voted')
      : undefined;

    const activeProps = {
      votedAlertLabel,
      voteProgress: relativeVoteCount(proposal.approval.length, memberCount),
      winningOptionValue: `${proposal.approval.length} ${t(
        'votingTerminal.ofMemberCount',
        {memberCount}
      )}`,
    };
    return {...props, ...specificProps, ...activeProps};
  } else {
    return {...props, ...specificProps};
  }
  // } else {
  //   throw Error('invalid proposal type');
  // }
}

export default ProposalList;
