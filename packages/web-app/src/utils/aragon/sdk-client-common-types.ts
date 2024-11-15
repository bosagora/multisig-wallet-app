import {BigNumber} from '@ethersproject/bignumber';
/**
 * Contains the payload passed to the global DAO factory so that
 * plugins can be initialized
 */
export interface PluginInstallItem {
  id: string; // ENS domain or address of the plugin's Repo
  data: Uint8Array;
}

export type GasFeeEstimation = {
  average: bigint;
  max: bigint;
};

/**
 * Contains the payload passed to governance contracts, serializing
 * the actions to do upon approval
 */
export type DaoAction = {
  to: string;
  value: bigint;
  data: Uint8Array;
};

export type MetadataAbiInput = {
  name: string;
  type: string;
  internalType: string;
  description: string;
  components?: MetadataAbiInput[];
};

export type PrepareInstallationParams = {
  daoAddressOrEns: string;
  pluginRepo: string;
  version?: {
    build: number;
    release: number;
  };
  installationParams?: any[];
  installationAbi?: MetadataAbiInput[];
};

export enum PrepareInstallationStep {
  PREPARING = 'preparing',
  DONE = 'done',
}

export type PrepareInstallationStepValue =
  | {key: PrepareInstallationStep.PREPARING; txHash: string}
  | ({
      key: PrepareInstallationStep.DONE;
    } & ApplyInstallationParams);

export type ApplyInstallationParamsBase = {
  permissions: MultiTargetPermission[];
  versionTag: VersionTag;
  pluginRepo: string;
  pluginAddress: string;
};

export type ApplyInstallationParams = ApplyInstallationParamsBase & {
  helpers: string[];
};
export type DecodedApplyInstallationParams = ApplyInstallationParamsBase & {
  helpersHash: string;
};

/* Uninstallation */
export type PrepareUninstallationParams = {
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginInstallationIndex?: number;
  uninstallationParams?: any[];
  uninstallationAbi?: string[];
};
export enum PrepareUninstallationSteps {
  PREPARING = 'preparing',
  DONE = 'done',
}
export type PrepareUninstallationStepValue =
  | {key: PrepareUninstallationSteps.PREPARING; txHash: string}
  | ({
      key: PrepareUninstallationSteps.DONE;
    } & ApplyUninstallationParams);

export type ApplyUninstallationParams = ApplyInstallationParamsBase;
export type DecodedApplyUninstallationParams = ApplyInstallationParamsBase;

export type VersionTag = {
  build: number;
  release: number;
};

export enum PermissionOperationType {
  GRANT = 0,
  REVOKE = 1,
  GRANT_WITH_CONDITION = 2,
}

export type MultiTargetPermission = {
  operation: PermissionOperationType;
  where: string;
  who: string;
  condition?: string;
  permissionId: string;
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

export interface InterfaceParams {
  id: string;
  functionName: string;
  hash: string;
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

/**
 * Contains the human-readable information about a proposal
 */
export type ProposalMetadataSummary = {
  title: string;
  summary: string;
};

export enum ProposalStatus {
  ACTIVE = 'Active',
  // PENDING = 'Pending',
  // SUCCEEDED = 'Succeeded',
  EXECUTED = 'Executed',
  // DEFEATED = 'Defeated',
}

// Long version
// export type ProposalBase = {
//   id: string;
//   dao: {
//     address: string;
//     name: string;
//   };
//   creatorAddress: string;
//   metadata: ProposalMetadata;
//   metadataHash?: string;
//   startDate: Date;
//   endDate: Date;
//   creationDate: Date;
//   actions: DaoAction[];
//   status: ProposalStatus;
//   creationBlockNumber: number;
//   executionDate: Date | null;
//   executionBlockNumber: number | null;
//   executionTxHash: string | null;
// };
export type ProposalBase = {
  id: BigNumber;
  dao: {
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

// Short version
export type ProposalListItemBase = {
  id: string;
  dao: {
    address: string;
    name: string;
  };
  creatorAddress: string;
  metadata: ProposalMetadataSummary;
  metadataHash?: string;
  startDate: Date;
  endDate: Date;
  status: ProposalStatus;
  actions: DaoAction[];
};

export type PrepareUpdateParams = {
  pluginAddress: string;
  daoAddressOrEns: string;
  pluginInstallationIndex?: number;
  newVersion: VersionTag;
  updateParams?: any[];
  updateAbi?: MetadataAbiInput[];
  pluginRepo: string;
};

export enum PrepareUpdateStep {
  PREPARING = 'preparing',
  DONE = 'done',
}

export type PrepareUpdateStepValue =
  | {key: PrepareUpdateStep.PREPARING; txHash: string}
  | ({
      key: PrepareUpdateStep.DONE;
    } & ApplyUpdateParams);

export type ApplyUpdateParamsBase = {
  versionTag: VersionTag;
  initData: Uint8Array;
  pluginRepo: string;
  pluginAddress: string;
  permissions: MultiTargetPermission[];
};
export type ApplyUpdateParams = ApplyUpdateParamsBase & {
  helpers: string[];
};
export type DecodedApplyUpdateParams = ApplyUpdateParamsBase & {
  helpersHash: string;
};
export type IsMemberParams = {
  address: string;
  pluginAddress: string;
  blockNumber?: number;
};
