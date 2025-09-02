import { NetworkDeployment, SupportedNetwork } from "./interfaces/common";
import { activeContractsList } from "multisig-wallet-contracts-lib";
import { Network } from "@ethersproject/networks";

export const LIVE_CONTRACTS: { [K in SupportedNetwork]: NetworkDeployment } = {
    [SupportedNetwork.ETHEREUM_MAINNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.ethereum_mainnet.MultiSigWalletFactory,
    },
    [SupportedNetwork.ETHEREUM_SEPOLIA]: {
        MultiSigWalletFactoryAddress: activeContractsList.ethereum_testnet.MultiSigWalletFactory,
    },
    [SupportedNetwork.BOSAGORA_MAINNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_mainnet.MultiSigWalletFactory,
    },
    [SupportedNetwork.BOSAGORA_TESTNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_testnet.MultiSigWalletFactory,
    },
    [SupportedNetwork.MSW_DEVNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_devnet.MultiSigWalletFactory,
    },
};

export const ADDITIONAL_NETWORKS: Network[] = [
    {
        name: SupportedNetwork.ETHEREUM_MAINNET,
        chainId: 1,
    },
    {
        name: SupportedNetwork.ETHEREUM_SEPOLIA,
        chainId: 11155111,
    },
    {
        name: SupportedNetwork.BOSAGORA_MAINNET,
        chainId: 2151,
    },
    {
        name: SupportedNetwork.BOSAGORA_TESTNET,
        chainId: 2019,
    },
    {
        name: SupportedNetwork.MSW_DEVNET,
        chainId: 24002,
    },
];
