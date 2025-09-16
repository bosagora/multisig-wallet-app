import {HeaderDao} from 'msw-ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {MembershipSnapshot} from 'containers/membershipSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {useAlertContext} from 'context/alert';
import {NavigationMSWallet} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {useMSWalletQuery} from 'hooks/useMSWalletDetails';
import {
  useaddFavoriteMSWalletMutation,
  useFavoritedDaosQuery,
  useremoveFavoriteMSWalletMutation,
} from 'hooks/useFavoritedDaos';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, SupportedChainID} from 'utils/constants';
import {formatDate} from 'utils/date';
import {NotFound} from 'utils/paths';
import {useGlobalModalContext} from 'context/globalModals';
import {useMSWalletVault} from '../hooks/useMSWalletVault';
import ProposalSnapshot from 'containers/proposalSnapshot';
import {useProposals} from '../hooks/useProposals';
const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop, isMobile} = useScreen();

  const navigate = useNavigate();
  const {network} = useNetwork();
  const {msWallet: multisigWalletAddress} = useParams();
  const {open} = useGlobalModalContext();

  const [pollInterval, setPollInterval] = useState(0);
  // favoring DAOS
  const addFavoriteMSWalletMutation = useaddFavoriteMSWalletMutation(() =>
    alert(t('alert.chip.favorited'))
  );

  const removeFavoriteMSWalletMutation = useremoveFavoriteMSWalletMutation(() =>
    alert(t('alert.chip.unfavorite'))
  );

  const {data: favoritedDaos, isLoading: favoritedDaosLoading} =
    useFavoritedDaosQuery();

  // live DAO
  const {
    data: walletDetail,
    isLoading: walletDetailLoading,
    isSuccess,
  } = useMSWalletQuery(multisigWalletAddress, pollInterval);

  const favoriteMSWalletMatchPredicate = useCallback(
    (favoriteDao: NavigationMSWallet) => {
      return (
        favoriteDao.address.toLowerCase() ===
          walletDetail?.address.toLowerCase() &&
        favoriteDao.chain === CHAIN_METADATA[network].id
      );
    },
    [walletDetail?.address, network]
  );

  const isFavoritedMSWallet = useMemo(() => {
    if (walletDetail?.address && favoritedDaos)
      return Boolean(favoritedDaos.some(favoriteMSWalletMatchPredicate));
    else return false;
  }, [favoriteMSWalletMatchPredicate, favoritedDaos, walletDetail?.address]);

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  /*************************************************
   *                    Handlers                   *
   *************************************************/

  const handleClipboardActions = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/#/multisig-wallets/${network}/${multisigWalletAddress}`
    );
    alert(t('alert.chip.inputCopied'));
  }, [alert, multisigWalletAddress, network, t]);

  const handleFavoriteClick = useCallback(
    async (msWallet: NavigationMSWallet) => {
      try {
        if (isFavoritedMSWallet) {
          await removeFavoriteMSWalletMutation.mutateAsync({msWallet});
        } else {
          await addFavoriteMSWalletMutation.mutateAsync({msWallet});
        }
      } catch (error) {
        const action = isFavoritedMSWallet
          ? 'removing DAO from favorites'
          : 'adding DAO to favorites';

        console.error(`Error ${action}`, error);
      }
    },
    [
      isFavoritedMSWallet,
      removeFavoriteMSWalletMutation,
      addFavoriteMSWalletMutation,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (walletDetailLoading || favoritedDaosLoading) {
    return <Loading />;
  }

  if (walletDetail && multisigWalletAddress) {
    return (
      <>
        <HeaderWrapper>
          <HeaderDao
            walletName={walletDetail.metadata.name}
            daoUrl={`${window.location.origin}/#/multisig-wallets/${network}/${multisigWalletAddress}`}
            description={walletDetail.metadata.description}
            created_at={formatDate(
              walletDetail.creationDate.getTime() / 1000,
              'MMMM yyyy'
            ).toString()}
            daoChain={CHAIN_METADATA[network].name}
            favorited={isFavoritedMSWallet}
            copiedOnClick={handleClipboardActions}
            onFavoriteClick={() =>
              handleFavoriteClick({
                address: walletDetail.address.toLowerCase(),
                chain: walletDetail.chain as SupportedChainID,
                metadata: {
                  name: walletDetail.metadata.name,
                  description: walletDetail.metadata.description,
                },
              })
            }
          />
        </HeaderWrapper>

        {isDesktop ? (
          <DashboardContent multisigWalletAddress={multisigWalletAddress} />
        ) : (
          <MobileDashboardContent
            multisigWalletAddress={multisigWalletAddress}
          />
        )}
      </>
    );
  } else if (!walletDetail) {
    // if DAO isn't loading and there is no pending or live DAO, then
    // navigate to notFound
    navigate(NotFound, {
      replace: true,
      state: {incorrectDao: multisigWalletAddress},
    });
  }

  return null;
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0 desktop:col-start-2 desktop:col-span-10 tablet:mt-3',
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  multisigWalletAddress: string;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  multisigWalletAddress,
}) => {
  const {transfers, totalAssetValue} = useMSWalletVault();
  const {data: tempProposals, totalCount} = useProposals(
    multisigWalletAddress,
    'multisig.plugin.wallet.eth',
    4
  );

  const proposals = useMemo(() => {
    return tempProposals ? tempProposals.slice(0, 4) : [];
  }, [tempProposals]);

  return (
    <>
      <LeftWideContent>
        <ProposalSnapshot
          multisigWalletAddress={multisigWalletAddress}
          proposals={proposals}
          proposalLength={totalCount || 0}
        />
      </LeftWideContent>

      <RightNarrowContent>
        <TreasurySnapshot
          multiSignatureWalletAddress={multisigWalletAddress}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />

        <MembersWrapper>
          <MembershipSnapshot multisigWalletAddress={multisigWalletAddress} />
        </MembersWrapper>
      </RightNarrowContent>
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

const LeftWideContent = styled.div.attrs({
  className: 'desktop:space-y-5 desktop:col-start-2 desktop:col-span-6',
})``;

const RightNarrowContent = styled.div.attrs({
  className: 'desktop:col-start-8 desktop:col-span-4 desktop:space-y-3',
})``;

const EqualDivide = styled.div.attrs({
  className:
    'desktop:col-start-2 desktop:col-span-10 desktop:flex desktop:space-x-3',
})``;

const MembersWrapper = styled.div.attrs({
  className: 'desktop:col-start-2 desktop:col-span-10',
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  multisigWalletAddress,
}) => {
  const {transfers, totalAssetValue} = useMSWalletVault();
  const {data: tempProposals, totalCount} = useProposals(
    multisigWalletAddress,
    'multisig.plugin.wallet.eth',
    4
  );

  const proposals = useMemo(() => {
    return tempProposals ? tempProposals.slice(0, 4) : [];
  }, [tempProposals]);

  return (
    <MobileLayout>
      <ProposalSnapshot
        multisigWalletAddress={multisigWalletAddress}
        proposals={proposals}
        proposalLength={totalCount || 0}
      />
      <TreasurySnapshot
        multiSignatureWalletAddress={multisigWalletAddress}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot multisigWalletAddress={multisigWalletAddress} />
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
