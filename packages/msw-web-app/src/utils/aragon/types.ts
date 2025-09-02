export * from './sdk-client-types';
export * from './sdk-client-common-types';
export * from './sdk-client-multisig-types';
export const GaslessPluginName =
  'vocdoni-gasless-voting-poc-vanilla-erc20.plugin.msWallet.eth';
export type GaslessPluginType = typeof GaslessPluginName;

export type PluginTypes =
  | 'token-voting.plugin.msWallet.eth'
  | 'multisig.plugin.msWallet.eth'
  | GaslessPluginType;
