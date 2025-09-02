import {SupportedNetworks} from './chains';

export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';


export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const ASSET_PLATFORMS: Record<SupportedNetworks, string | null> = {
  ethereum: 'ethereum',
  sepolia: null,
  bosagora_mainnet: 'boa',
  bosagora_testnet: null,
  msw_devnet: null,
  unsupported: null,
};

export const NATIVE_TOKEN_ID = {
  default: 'ethereum',
  bosagora: 'bosagora',
};

export const defaultChainName = import.meta.env
  .VITE_DEFAULT_CHAIN_NAME as SupportedNetworks;

export const defaultChainID = import.meta.env.VITE_DEFAULT_CHAIN_ID as number;
