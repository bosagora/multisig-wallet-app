import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from 'msw-ui-components';
import {UseInfiniteQueryResult} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {WalletCard} from '../../components/walletCard';
import {useFavoritedDaosInfiniteQuery} from 'hooks/useFavoritedDaos';
import {
  AugmentedDaoListItem,
  ExploreFilter,
  EXPLORE_FILTER,
  useMSWalletsInfiniteQuery,
} from 'hooks/useMSWallets';
import {useWallet} from 'hooks/useWallet';
import {getSupportedNetworkByChainId, SupportedChainID} from 'utils/constants';
import {Dashboard} from 'utils/paths';

export function isExploreFilter(
  filterValue: string
): filterValue is ExploreFilter {
  return EXPLORE_FILTER.some(ef => ef === filterValue);
}

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isConnected, address} = useWallet();

  // conditional api queries
  const daosApi = useMSWalletsInfiniteQuery(
    address || '',
    true,
    {limit: 4}
  );

  // resulting api response
  const exploreDaosApi = useMemo(
    () =>
      (daosApi) as UseInfiniteQueryResult<
        AugmentedDaoListItem,
        unknown
      >,
    [address, daosApi]
  );


  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleDaoClicked = (msWallet: string, chain: SupportedChainID) => {
    navigate(
      generatePath(Dashboard, {
        network: getSupportedNetworkByChainId(chain),
        msWallet,
      })
    );
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
        </HeaderWrapper>
        <CardsWrapper>
          {exploreDaosApi.isLoading ? (
            <Spinner size="default" />
          ) : (
            exploreDaosApi.data?.pages?.map(msWallet => (
              <WalletCard
                key={msWallet.address}
                address={msWallet.address}
                name={msWallet.metadata.name}
                description={msWallet.metadata.description}
                chainId={msWallet.chain}
                onClick={() =>
                  handleDaoClicked(
                    msWallet.address,
                    msWallet.chain as SupportedChainID
                  )
                }
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {exploreDaosApi.hasNextPage && (
        <div>
          <ButtonText
            css={{}}
            label={t('explore.explorer.showMore')}
            iconRight={
              exploreDaosApi.isFetching && exploreDaosApi.isFetchingNextPage ? (
                <Spinner size="xs" />
              ) : (
                <IconChevronDown />
              )
            }
            bgWhite
            mode="ghost"
            onClick={() => exploreDaosApi.fetchNextPage()}
          />
        </div>
      )}
    </Container>
  );
};

/**
 * Map explore filter to SDK DAO sort by
 * @param filter selected DAO category
 * @returns the equivalent of the SDK enum
 */

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-2 desktop:space-y-3',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-1.5',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-2 desktop:flex-row desktop:space-y-0 desktop:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-2 desktop:gap-3',
})``;
const Title = styled.p.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;
