import {
  TokenType,
} from './sdk-client-common-types';

/* DAOs */
export type DaoResourceLink = {name: string; url: string};
export type DaoMetadata = {
  name: string;
  description: string;
  avatar?: string;
  links: DaoResourceLink[];
};
export type walletDetails = {
  address: string;
  ensDomain: string;
  metadata: DaoMetadata;
  metadataHash?: string;
  creationDate: Date;
  plugins: InstalledPluginListItem[];
};

/* Plugins */

export type InstalledPluginListItem = {
  id: string;
  instanceAddress: string;
  release: number;
  build: number;
};


/* Withdrawals */
type WithdrawParamsBase = {
  recipientAddressOrEns: string;
};

type WithdrawEthParams = WithdrawParamsBase & {
  type: TokenType.NATIVE;
  amount: bigint;
};

type WithdrawErc20Params = WithdrawParamsBase & {
  type: TokenType.ERC20;
  amount: bigint;
  tokenAddress: string;
};

type WithdrawErc721Params = WithdrawParamsBase & {
  type: TokenType.ERC721;
  tokenAddress: string;
  tokenId: bigint;
  multisigWalletAddress: string;
};

type WithdrawErc1155Params = WithdrawParamsBase & {
  type: TokenType.ERC1155;
  multisigWalletAddress: string;
  tokenAddress: string;
  tokenIds: bigint[];
  amounts: bigint[];
};

export type WithdrawParams =
  | WithdrawEthParams
  | WithdrawErc20Params
  | WithdrawErc721Params
  | WithdrawErc1155Params;

/* Balances */
type AssetBalanceBase = {
  id: string;
  address: string;
  updateDate: Date;
  logoURI?: string;
};

type NativeAssetBalance = {
  id: string;
  type: TokenType.NATIVE;
  balance: bigint;
  updateDate: Date;
};
type Erc20AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC20;
  balance: bigint;
  decimals: number;
  name: string;
  symbol: string;
};
type Erc721AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC721;
  tokenIds: bigint[];
  name: string;
  symbol: string;
};

type Erc1155AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC1155;
  balances: {
    id: string;
    tokenId: bigint;
    amount: bigint;
  }[];
  metadataUri: string;
};

export type AssetBalance =
  | NativeAssetBalance
  | Erc20AssetBalance
  | Erc721AssetBalance
  | Erc1155AssetBalance;

/* Transfers */

type TokenTransferBase = {
  creationDate: Date;
  transactionId: string;
  to: string;
  from: string;
};

type TokenBase = {
  address: string;
  name: string;
  symbol: string;
};

type NativeTokenTransfer = TokenTransferBase & {
  tokenType: TokenType.NATIVE;
  amount: bigint;
};

type Erc721TokenTransfer = TokenTransferBase & {
  tokenType: TokenType.ERC721;
  token: TokenBase;
};

type Erc20TokenTransfer = TokenTransferBase & {
  tokenType: TokenType.ERC20;
  amount: bigint;
  token: TokenBase & {
    decimals: number;
  };
};

type Erc1155TokenTransfer = TokenTransferBase & {
  tokenType: TokenType.ERC1155;
  tokenId: bigint;
  token: {
    address: string;
  };
  amount: bigint;
};

export enum TransferType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export type Deposit = (
  | NativeTokenTransfer
  | Erc20TokenTransfer
  | Erc721TokenTransfer
  | Erc1155TokenTransfer
) & {
  type: TransferType.DEPOSIT;
};


