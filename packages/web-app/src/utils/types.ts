import {
  MultisigProposal,
  MultisigProposalListItem,
  MultisigVotingSettings,
  VoteValues,
  VotingSettings,
} from 'utils/aragon/types';
import {BigNumber} from 'ethers';

import {TimeFilter, TransferTypes} from './constants';
import {Web3Address} from './library';

/*************************************************
 *                   Finance types               *
 *************************************************/
/**
 * Token with basic information populated from external api and/or blockchain
 * Market information is not included
 */
export type BaseTokenInfo = {
  address: string;
  count: bigint;
  decimals: number;
  id?: string; // for api call, optional because custom tokens have no id
  imgUrl: string;
  name: string;
  symbol: string;
};

/** The balance for a token */
export type TokenBalance = {
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    price?: number;
  };
  balance: bigint;
};

/**
 * Token with basic information populated from external api and/or blockchain
 * Market information is not included
 */
export type TokenWithMetadata = {
  balance: bigint;
  metadata: TokenBalance['token'] & {
    apiId?: string;
    imgUrl: string;
  };
};

/**
 * Token current price, and price change percentage for given filter
 * @property {number} price - current market price
 * @property {number} balanceValue - current balance value in USD
 * @property {number} priceChangeDuringInterval - change in market price from interval time in past until now
 * @property {number} valueChangeDuringInterval - change in balance value from interval time in past until now
 * @property {number} percentageChangedDuringInterval - percentage change from market price interval time ago to current market price
 */
export interface MarketData {
  price: number;
  balanceValue: number;
  priceChangeDuringInterval: number;
  valueChangeDuringInterval?: number;
  percentageChangedDuringInterval: number;
}

export type TokenWithMarketData = TokenWithMetadata & {
  marketData?: MarketData;
};

/** Token populated with DAO treasury information; final iteration to be displayed */
export type VaultToken = TokenWithMarketData & {
  treasurySharePercentage?: number;
};

export type PollTokenOptions = {interval?: number; filter: TimeFilter};

// Transfers
/** A transfer transaction */
export type BaseTransfer = {
  id: string;
  title: string;
  tokenAmount: string;
  tokenSymbol: string;
  transferDate: string;
  transferTimestamp?: string | number;
  usdValue: string;
  isPending?: boolean;
  tokenImgUrl: string;
  tokenName: string;
  reference?: string;
  transaction: string;
  tokenAddress: string;
};

export type Deposit = BaseTransfer & {
  sender: string;
  transferType: TransferTypes.Deposit;
};
export type Withdraw = BaseTransfer & {
  proposalId: ProposalId;
  to: string;
  transferType: TransferTypes.Withdraw;
};

export type Transfer = Deposit | Withdraw;

/*************************************************
 *                  Proposal types               *
 *************************************************/

export type ProposalData = UncategorizedProposalData & {
  type: 'draft' | 'pending' | 'active' | 'succeeded' | 'executed' | 'defeated';
};

type Seconds = string;

export type UncategorizedProposalData = {
  id: string;
  metadata: ProposalMetadata;
  vote: VotingData;
  execution: ExecutionData;
  creator: string;
};

type ProposalMetadata = {
  title: string;
  description: string;
  resources?: ProposalResource[];
  published?: BlockChainInteraction;
  executed?: BlockChainInteraction;
};

export type ProposalResource = {
  name: string;
  url: string;
};

type BlockChainInteraction = {
  date: Seconds;
  block: string;
};

export type VotingData = {
  start: Seconds;
  end: Seconds;
  total: number;
  results: Record<string, number>; // e.g. option -> amount of votes
  tokenSymbol: string;
};

type ExecutionData = {
  from: string;
  to: string;
  amount: number;
};

export type Erc20ProposalVote = {
  address: string;
  vote: VoteValues;
  weight: bigint;
};

export type DetailedProposal = MultisigProposal;
export type ProposalListItem = MultisigProposalListItem;
export type SupportedProposals = DetailedProposal | ProposalListItem;

export type SupportedVotingSettings = MultisigVotingSettings | VotingSettings;

/* ACTION TYPES ============================================================= */

export type ActionIndex = {
  actionIndex: number;
};

/**
 * Metadata for actions. This data can not really be fetched and is therefore
 * declared locally.
 */
export type ActionParameter = {
  type: ActionsTypes;
  /**
   * Name displayed in the UI
   */
  title: string;
  /**
   * Description displayed in the UI
   */
  subtitle: string;
  /**
   * Whether an action can be used several times in a proposal. Currently
   * actions are either limited to 1 or not limited at all. This might need to
   * be changed to a number if the rules for reuseability become more complex.
   */
  isReuseable?: boolean;
};

/**
 * All available types of action for DAOs
 */
// TODO: rename actions types and names to be consistent
// either update or modify
export type ActionsTypes =
  | 'add_address'
  | 'remove_address'
  | 'withdraw_assets'
  | 'mint_tokens'
  | 'external_contract_modal'
  | 'external_contract_action'
  | 'wallet_connect_modal'
  | 'wallet_connect_action'
  | 'modify_token_voting_settings'
  | 'modify_metadata'
  | 'modify_multisig_voting_settings'
  | 'update_minimum_approval';

export type ActionWithdraw = {
  amount: number;
  name: 'withdraw_assets';
  to: Web3Address;
  tokenAddress: string;
  tokenBalance: number;
  tokenDecimals: number;
  tokenImgUrl: string;
  tokenName: string;
  tokenPrice: number;
  tokenSymbol: string;
  isCustomToken: boolean;
};

// TODO: merge these types
export type ActionAddAddress = {
  name: 'add_address';
  inputs: {
    memberWallets: Array<{
      address: string;
      ensName: string;
    }>;
  };
};

export type ActionRemoveAddress = {
  name: 'remove_address';
  inputs: {
    memberWallets: Array<{
      address: string;
      ensName: string;
    }>;
  };
};

export type ActionUpdateMinimumApproval = {
  name: 'update_minimum_approval';
  inputs: {
    minimumApproval: number;
  };
  summary: {
    addedWallets: number;
    removedWallets: number;
    totalWallets?: number;
  };
};

export type ActionMintToken = {
  name: 'mint_tokens';
  inputs: {
    mintTokensToWallets: {
      address: string;
      amount: string | number;
    }[];
  };
  summary: {
    newTokens: number;
    tokenSupply: number;
    newHoldersCount: number;
    daoTokenSymbol: string;
    daoTokenAddress: string;
    totalMembers?: number;
  };
};

export type ActionSCC = {
  name: 'external_contract_action';
  contractName: string;
  contractAddress: string;
  functionName: string;
  inputs: Array<ExternalActionInput>;
  value?: string;
};

// Alias
export type ActionExternalContract = ActionWC;
export type ExternalActionInput = {
  name: string;
  type: string;
  notice?: string;
  value: object | string | BigNumber;
};

export type ActionWC = Omit<ActionSCC, 'name'> & {
  name: 'wallet_connect_action';
  notice?: string;
  verified: boolean;
  decoded: boolean;
  // considering we have the raw action directly from WC, there
  // is no need to decode it, re-encode it, only to decode it again
  // when displaying on the proposal details page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
};

// TODO: Consider making this a generic type that take other types of the form
// like ActionAddAddress (or more generically, ActionItem...?) instead taking the
// union of those subtypes. [VR 11-08-2022]
export type Action =
  | ActionWithdraw
  | ActionAddAddress
  | ActionRemoveAddress
  | ActionMintToken
  | ActionUpdateMinimumApproval
  | ActionSCC
  | ActionWC;

export type ParamType = {
  type: string;
  name?: string;
  value: string;
};

/**
 *  Inputs prop is using for custom smart contract methods that have unknown fields
 */
export type ActionItem = {
  name: ActionsTypes;
  inputs?: ParamType[];
};

export type TransactionItem = {
  type: TransferTypes;
  data: {
    sender: string;
    amount: number;
    tokenContract: string;
  };
};

/* MISCELLANEOUS TYPES ======================================================= */
export type Dao = {
  address: string;
};

/* UTILITY TYPES ============================================================ */

/** Return type for data hooks */
export type HookData<T> = {
  data: T;
  isLoading: boolean;
  isInitialLoading?: boolean;
  isLoadingMore?: boolean;
  error?: Error;
};

export type Nullable<T> = T | null;

export type StrictlyExclude<T, U> = T extends U ? (U extends T ? never : T) : T;

export type StringIndexed = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/* SCC TYPES ============================================================ */
export type EtherscanContractResponse = {
  ABI: string;
  CompilerVersion: string;
  ContractName: string;
  EVMVersion: string;
  LicenseType: string;
  SourceCode: string;
};

export type SourcifyContractResponse = {
  output: {
    abi: SmartContractAction[];
    devdoc: {
      title: string;
      methods: {
        // contract write method name with its input params
        [key: string]: {
          // description for each method
          details: string;
          params: {
            // contract method input params
            [key: string]: string;
          };
          returns: {
            // contract method output params
            [key: string]: string;
          };
        };
      };
    };
  };
};

export type SmartContractAction = {
  name: string;
  type: string;
  stateMutability: string;
  inputs: Input[];
  notice?: string;
};

export interface Input {
  name: string;
  type: string;
  indexed?: boolean;
  components?: Input[];
  internalType?: string;
  notice?: string;
  value?: string;
}

export type SmartContract = {
  actions: Array<SmartContractAction>;
  address: string;
  logo?: string;
  name: string;
};

export type VerifiedContracts = {
  // key is wallet address
  [key: string]: {
    // key is chain id
    [key: number]: Array<SmartContract>;
  };
};

/**
 * Opaque class encapsulating a proposal id, which can
 * be globally unique or just unique per plugin address
 */
export class ProposalId {
  private id: string;

  constructor(val: string) {
    this.id = val.toString();
  }

  /** Returns proposal id in form needed for SDK */
  export() {
    return this.id;
  }

  /** Make the proposal id globally unique by combining with an address (should be plugin address) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  makeGloballyUnique(_: string): string {
    return this.id;
  }

  /** Return a string to be used as part of a url representing a proposal */
  toUrlSlug(): string {
    return this.id;
  }

  /** The proposal id as a string */
  toString() {
    return this.id;
  }
}
