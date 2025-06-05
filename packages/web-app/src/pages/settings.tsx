import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import MultisigSettings from 'containers/settings/multisig';
import {useNetwork} from 'context/network';
import {useMSWalletDetailsQuery} from 'hooks/useMSWalletDetails';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {walletDetails} from '../utils/aragon/sdk-client-types';

const Settings: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const {data: walletDetails, isLoading} = useMSWalletDetailsQuery();

  const networkInfo = CHAIN_METADATA[network];
  const chainLabel = networkInfo.name;
  const networkType = networkInfo.testnet
    ? t('labels.testNet')
    : t('labels.mainNet');

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SettingsWrapper>
      <div className="mt-3 desktop:mt-8 space-y-5">
        {/* BLOCKCHAIN SECTION */}
        <DescriptionListContainer
          title={t('labels.review.blockchain')}
          // tagLabel={t('labels.notChangeable')}
        >
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{networkType}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>{chainLabel}</Dd>
          </Dl>
        </DescriptionListContainer>

        {/* DAO DETAILS SECTION */}
        <DescriptionListContainer title={t('labels.review.daoMetadata')}>
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{walletDetails?.metadata.name}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{walletDetails?.metadata.description}</Dd>
          </Dl>
        </DescriptionListContainer>
      </div>
    </SettingsWrapper>
  );
};

export interface IPluginSettings {
  walletDetails: walletDetails | undefined | null;
}

export const SettingsWrapper: React.FC = ({children}) => {
  const {t} = useTranslation();

  return (
    <PageWrapper
      title={t('labels.daoSettings')}
      // TODO add correct description once available in designs [VR 17-01-2023]
      description="Review your Multisig wallet's settings"
      customBody={<Layout>{children}</Layout>}
    />
  );
};

export const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-4 desktop:col-end-10 text-ui-600' as string,
})``;

export default withTransaction('Settings', 'component')(Settings);
