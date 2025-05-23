import {
  ButtonText,
  CardProposal,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
// import {PluginTypes} from 'hooks/usePluginClient';
import {htmlIn} from 'utils/htmlIn';
import {Governance, NewProposal} from 'utils/paths';
import {ProposalListItem} from 'utils/types';
import {useWallet} from 'hooks/useWallet';

type Props = {
  daoAddressOrEns: string;
  proposals: ProposalListItem[];
  proposalLength: number;
};

const ProposalSnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  proposals,
  proposalLength,
}) => {
  //console.log'ProposalSnapshot');
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork(); // TODO ensure this is the dao network

  const {data: members, isLoading: areMembersLoading} = useDaoMembers(
    daoAddressOrEns,
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
          daoAddressOrEns,
          address
        );
      }),
    [
      proposals,
      members.members.length,
      network,
      navigate,
      t,
      daoAddressOrEns,
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
              generatePath(NewProposal, {network, dao: daoAddressOrEns})
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
          navigate(generatePath(NewProposal, {network, dao: daoAddressOrEns}))
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
          navigate(generatePath(Governance, {network, dao: daoAddressOrEns}))
        }
      />
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2 w-full',
})``;
