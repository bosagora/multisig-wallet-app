// import {DaoDetails} from '@aragon/sdk-client';
import {
  AlertInline,
  AvatarDao,
  ButtonText,
  IconGovernance,
  ListItemLink,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
// import MajorityVotingSettings from 'containers/settings/majorityVoting';
import MultisigSettings from 'containers/settings/multisig';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {EditSettings} from 'utils/paths';
import {DaoDetails} from '../utils/aragon/sdk-client-types';

const Settings: React.FC = () => {
  const {t} = useTranslation();
  const {network, isL2Network} = useNetwork();
  const navigate = useNavigate();

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const networkInfo = CHAIN_METADATA[network];
  const chainLabel = networkInfo.name;
  const networkType = networkInfo.testnet
    ? t('labels.testNet')
    : t('labels.mainNet');

  const resourceLinks = daoDetails?.metadata.links?.filter(
    l => l.name && l.url
  );

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
            <Dd>
              <AvatarDao
                size={'small'}
                daoName={daoDetails?.metadata.name || ''}
                src={daoDetails?.metadata.avatar}
              />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{daoDetails?.metadata.name}</Dd>
          </Dl>
          {/*{!isL2Network && (*/}
          {/*  <Dl>*/}
          {/*    <Dt>{t('labels.ens')}</Dt>*/}
          {/*    <Dd>{daoDetails?.ensDomain}</Dd>*/}
          {/*  </Dl>*/}
          {/*)}*/}
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{daoDetails?.metadata.description}</Dd>
          </Dl>
          {resourceLinks && resourceLinks.length > 0 && (
            <Dl>
              <Dt>{t('labels.links')}</Dt>
              <Dd>
                <div className="space-y-1.5">
                  {resourceLinks.map(({name, url}) => (
                    <ListItemLink label={name} href={url} key={url} />
                  ))}
                </div>
              </Dd>
            </Dl>
          )}
        </DescriptionListContainer>

        {/* Plugins */}
        <PluginSettingsWrapper daoDetails={daoDetails} />
      </div>

      {/* Edit */}
      {/*<div className="space-y-2">*/}
      {/*  <ButtonText*/}
      {/*    css={{}}*/}
      {/*    label={t('settings.edit')}*/}
      {/*    className="mt-5 desktop:mt-8 w-full tablet:w-max"*/}
      {/*    size="large"*/}
      {/*    iconLeft={<IconGovernance />}*/}
      {/*    onClick={() => navigate('edit')}*/}
      {/*  />*/}
      {/*  <AlertInline label={t('settings.proposeSettingsInfo')} />*/}
      {/*</div>*/}
    </SettingsWrapper>
  );
};

export interface IPluginSettings {
  daoDetails: DaoDetails | undefined | null;
}

export const PluginSettingsWrapper: React.FC<IPluginSettings> = ({
  daoDetails,
}) => {
  return <MultisigSettings daoDetails={daoDetails} />;
};

export const SettingsWrapper: React.FC = ({children}) => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();

  const {dao} = useParams();
  const {network} = useNetwork();
  const navigate = useNavigate();

  return (
    <PageWrapper
      title={t('labels.daoSettings')}
      // TODO add correct description once available in designs [VR 17-01-2023]
      description="Review your Multisig wallet's settings"
      // primaryBtnProps={
      //   isMobile
      //     ? {
      //         label: t('settings.edit'),
      //         iconLeft: <IconGovernance />,
      //         onClick: () =>
      //           navigate(generatePath(EditSettings, {network, dao})),
      //       }
      //     : undefined
      // }
      customBody={<Layout>{children}</Layout>}
    />
  );
};

export const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-4 desktop:col-end-10 text-ui-600' as string,
})``;

export default withTransaction('Settings', 'component')(Settings);
