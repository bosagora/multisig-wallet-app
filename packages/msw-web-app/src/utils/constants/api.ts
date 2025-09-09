import {SupportedNetworks} from './chains';

export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const defaultChainName = import.meta.env
  .VITE_DEFAULT_CHAIN_NAME as SupportedNetworks;

export const defaultChainID = import.meta.env.VITE_DEFAULT_CHAIN_ID as number;
