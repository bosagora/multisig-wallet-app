/* TOP LEVEL PAGES ========================================================== */
export const Landing = '/';
export const CreateMSWallet = '/create';
export const NotFound = '/not-found';

/* DAO-SPECIFIC PAGES ======================================================= */

export const Dashboard = '/multisig-wallets/:network/:msWallet/dashboard';
export const Finance = '/multisig-wallets/:network/:msWallet/finance';
export const Governance = '/multisig-wallets/:network/:msWallet/governance';
export const Community = '/multisig-wallets/:network/:msWallet/community';
export const Settings = '/multisig-wallets/:network/:msWallet/settings';
export const EditSettings =
  '/multisig-wallets/:network/:msWallet/settings/edit';
export const ProposeNewSettings =
  '/multisig-wallets/:network/:msWallet/settings/new-proposal';

export const AllTransfers =
  '/multisig-wallets/:network/:msWallet/finance/transfers';
export const NewDeposit =
  '/multisig-wallets/:network/:msWallet/finance/new-deposit';
export const NewWithDraw =
  '/multisig-wallets/:network/:msWallet/finance/new-withdrawal';

export const Proposal =
  '/multisig-wallets/:network/:msWallet/governance/proposals/:id';
export const NewProposal =
  '/multisig-wallets/:network/:msWallet/governance/new-proposal';
export const MintTokensProposal =
  '/multisig-wallets/:network/:msWallet/community/mint-tokens';
export const ManageMembersProposal =
  '/multisig-wallets/:network/:msWallet/community/manage-members';
