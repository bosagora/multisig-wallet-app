// Simple state management to replace Apollo Client reactive variables

import {useEffect, useState} from 'react';
import {
  defaultChainID,
  FAVORITE_WALLETS_KEY,
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_MULTISIG_VOTES_KEY,
  SupportedChainID,
} from 'utils/constants';
import {WalletDetails} from 'multisig-wallet-sdk-client';
import {customJSONReviver} from '../utils/library';
import {DetailedProposal} from '../utils/types';
import {VotingMode} from '../utils/aragon/sdk-client-multisig-types';

// Simple reactive variable implementation
class ReactiveVar<T> {
  private value: T;
  private listeners: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    this.value = newValue;
    this.listeners.forEach(listener => listener(newValue));
  }

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Factory function to create reactive variables
function makeVar<T>(initialValue: T): ReactiveVar<T> {
  return new ReactiveVar(initialValue);
}

// React hook to use reactive variables
export function useReactiveVar<T>(reactiveVar: ReactiveVar<T>): T {
  const [value, setValue] = useState<T>(reactiveVar.get());

  useEffect(() => {
    const unsubscribe = reactiveVar.subscribe(setValue);
    return unsubscribe;
  }, [reactiveVar]);

  return value;
}

/*************************************************
 *            FAVORITE & SELECTED DAOS           *
 *************************************************/
// including description, type, and chain in anticipation for
// showing these daos on explorer page
export type NavigationMSWallet = Omit<
  WalletDetails,
  'creationDate' | 'metadata'
> & {
  address: string;
  metadata: {
    name: string;
    description?: string;
  };
  creationDate?: Date;
  chain: SupportedChainID;
};
const favoriteMSWallets = JSON.parse(
  localStorage.getItem(FAVORITE_WALLETS_KEY) || '[]'
);
export const favoriteMSWalletsVar =
  makeVar<Array<NavigationMSWallet>>(favoriteMSWallets);

export const selectedMSWalletVar = makeVar<NavigationMSWallet>({
  address: '',
  metadata: {
    name: '',
  },
  chain: 2151,
});

/*************************************************
 *                 PENDING PROPOSAL              *
 *************************************************/
// iffy about this structure
export type CachedProposal = Omit<
  DetailedProposal,
  'creationBlockNumber' | 'executionBlockNumber' | 'executionDate' | 'status'
> & {
  votingMode?: VotingMode;
  minApprovals?: number;
};

export type PendingMultisigApprovals = {
  /** key is: daoAddress_proposalId; value: wallet address */
  [key: string]: string;
};
const pendingMultisigApprovals = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_VOTES_KEY) || '{}'
);

export const pendingMultisigApprovalsVar = makeVar<PendingMultisigApprovals>(
  pendingMultisigApprovals
);

/*************************************************
 *                PENDING EXECUTION              *
 *************************************************/
// Token-based
export type PendingTokenBasedExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingTokenBasedExecution = JSON.parse(
  localStorage.getItem(PENDING_EXECUTION_KEY) || '{}',
  customJSONReviver
);
export const pendingTokenBasedExecutionVar =
  makeVar<PendingTokenBasedExecution>(pendingTokenBasedExecution);

//================ Multisig
export type PendingMultisigExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingMultisigExecution = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_EXECUTION_KEY) || '{}',
  customJSONReviver
);
export const pendingMultisigExecutionVar = makeVar<PendingMultisigExecution>(
  pendingMultisigExecution
);

//================ Multisig
type PendingMultisigProposals = {
  // key is msWallet address
  [key: string]: {
    // key is proposal id
    [key: string]: CachedProposal;
  };
};
const pendingMultisigProposals = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
export const pendingMultisigProposalsVar = makeVar<PendingMultisigProposals>(
  pendingMultisigProposals
);
