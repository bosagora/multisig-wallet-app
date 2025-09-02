export enum SupportedNetwork {
    ETHEREUM_MAINNET = "homestead",
    ETHEREUM_SEPOLIA = "sepolia",
    BOSAGORA_MAINNET = "bosagora_mainnet",
    BOSAGORA_TESTNET = "bosagora_testnet",
    MSW_DEVNET = "msw_devnet"
}

export const SupportedNetworksArray = Object.values(SupportedNetwork);

export type NetworkDeployment = {
    MultiSigWalletFactoryAddress: string;
};

export type GasFeeEstimation = {
    average: bigint;
    max: bigint;
};
