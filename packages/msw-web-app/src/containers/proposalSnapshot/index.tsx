import {
  ButtonText,
  CardProposal,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from 'msw-ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {useMSWalletMembers} from '../../hooks/useMSWalletMembers';
import {htmlIn} from 'utils/htmlIn';
import {Governance, NewProposal} from 'utils/paths';
import {ProposalListItem} from 'utils/types';
import {useWallet} from 'hooks/useWallet';

type Props = {
  multisigWalletAddress: string;
  proposals: ProposalListItem[];
  proposalLength: number;
};

const ProposalSnapshot: React.FC<Props> = ({
  multisigWalletAddress,
  proposals,
  proposalLength,
}) => {
  //console.log'ProposalSnapshot');
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork(); // TODO ensure this is the msWallet network

  const {data: members, isLoading: areMembersLoading} = useMSWalletMembers(
    multisigWalletAddress,
    ''
  );

  const mappedProposals = useMemo(
    () =>
      proposals.map(p => {
        return proposal2CardProps(
          p,
          members.members.length,
          network,
          navigate,
          t,
          multisigWalletAddress,
          address
        );
      }),
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
  //console.log'mappedProposals : ', mappedProposals);
  if (proposalLength === 0 || areMembersLoading) {
    return (
      <StateEmpty
        type="Human"
        mode="card"
        body={'voting'}
        expression={'smile'}
        hair={'middle'}
        accessory={'earrings_rhombus'}
        sunglass={'big_rounded'}
        title={t('governance.emptyState.title')}
        description={htmlIn(t)('governance.emptyState.description')}
        primaryButton={{
          label: t('TransactionModal.createProposal'),
          onClick: () =>
            navigate(
              generatePath(NewProposal, {
                network,
                msWallet: multisigWalletAddress,
              })
            ),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<IconGovernance />}
        value={proposalLength.toString()}
        label={t('dashboard.proposalsTitle')}
        buttonText={t('newProposal.title')}
        orientation="horizontal"
        onClick={() =>
          navigate(
            generatePath(NewProposal, {
              network,
              msWallet: multisigWalletAddress,
            })
          )
        }
      />

      {mappedProposals.map(({id, ...p}) => (
        <CardProposal {...p} key={id} type="list" />
      ))}

      <ButtonText
        css={{}}
        mode="secondary"
        size="large"
        iconRight={<IconChevronRight />}
        label={t('labels.seeAll')}
        onClick={() =>
          navigate(
            generatePath(Governance, {network, msWallet: multisigWalletAddress})
          )
        }
      />
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2 w-full',
})``;
