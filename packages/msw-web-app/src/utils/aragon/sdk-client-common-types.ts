import {BigNumber} from '@ethersproject/bignumber';

/**
 * Contains the payload passed to governance contracts, serializing
 * the actions to do upon approval
 */
export type DaoAction = {
  to: string;
  value: bigint;
  data: Uint8Array;
};


export type Pagination = {
  skip?: number;
  limit?: number;
  direction?: SortDirection;
};

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum TokenType {
  NATIVE = 'native',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
}

/**
 * Contains the human-readable information about a proposal
 */
export type ProposalMetadata = {
  title: string;
  summary: string;
  description: string;
  resources: Array<{url: string; name: string}>;
  media?: {
    header?: string;
    logo?: string;
  };
};


export enum ProposalStatus {
  ACTIVE = 'Active',
  // PENDING = 'Pending',
  // SUCCEEDED = 'Succeeded',
  EXECUTED = 'Executed',
  // DEFEATED = 'Defeated',
}

export type ProposalBase = {
  id: BigNumber;
  msWallet: {
    address: string;
    name: string;
  };
  title: string;
  description: string;
  creator: string;
  createdTime: BigNumber;
  destination: string;
  value: BigNumber;
  data: string;
  executed: boolean;
  approval: string[];
  status: ProposalStatus;
};
