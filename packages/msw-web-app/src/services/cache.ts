// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {NavigationDao} from 'context/apolloClient';
import {
  FAVORITE_DAOS_KEY,
  SupportedChainID,
} from 'utils/constants';
import {sleepFor} from 'utils/library';

/**
 * Fetch a list of favorited DAOs
 * @param cache favorited DAOs cache (to be replaced when migrating to server)
 * @param options query options
 * @returns list of favorited DAOs based on given options
 */
export async function getFavoritedDaosFromCache(options: {
  skip: number;
  limit?: number;
}): Promise<NavigationDao[]> {
  const {skip, limit} = options;

  const favoriteDaos = JSON.parse(
    localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
  ) as NavigationDao[];

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  return favoriteDaos.slice(skip, limit ? skip + limit : undefined);
}

/**
 * Fetch a favorited DAO from the cache if available
 * @param msWalletAddress the address of the favorited DAO to fetch
 * @param chain the chain of the favorited DAO to fetch
 * @returns a favorited DAO with the given address and chain or null
 * if not found
 */
export async function getFavoritedDaoFromCache(
  msWalletAddress: string | undefined,
  chain: SupportedChainID
) {
  if (!msWalletAddress)
    return Promise.reject(new Error('multisigWalletAddress must be defined'));

  if (!chain) return Promise.reject(new Error('chain must be defined'));

  const daos = await getFavoritedDaosFromCache({skip: 0});
  return (
    daos.find(
      msWallet =>
        msWallet.address === msWalletAddress && msWallet.chain === chain
    ) ?? null
  );
}

/**
 * Favorite a DAO by adding it to the favorite DAOs cache
 * @param msWallet DAO being favorited
 * @returns an error if the msWallet to favorite is not provided
 */
export async function addFavoriteDaoToCache(msWallet: NavigationDao) {
  if (!msWallet)
    return Promise.reject(new Error('daoToFavorite must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = [msWallet, ...cache];

  localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Removes a favorite DAO from the cache
 * @param msWallet DAO to unfavorite
 * @returns an error if no DAO is provided
 */
export async function removeFavoriteDaoFromCache(msWallet: NavigationDao) {
  if (!msWallet) return Promise.reject(new Error('msWallet must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = cache.filter(
    fd =>
      fd.address.toLowerCase() !== msWallet.address.toLowerCase() ||
      fd.chain !== msWallet.chain
  );

  localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Update a DAO in the cache
 * @param msWallet updated DAO; note msWallet.address & msWallet.chain should never be changed
 * @returns an error if no DAO is provided
 */
export async function updateFavoritedDaoInCache(msWallet: NavigationDao) {
  if (!msWallet) return Promise.reject(new Error('msWallet must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const daoFound = cache.findIndex(
    d => d.address === msWallet.address && d.chain === msWallet.chain
  );

  if (daoFound !== -1) {
    const newCache = [...cache];
    newCache[daoFound] = {...msWallet};

    localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
  }
}
