import {NormalSteps} from 'multisig-wallet-sdk-client';
import React, {createContext, useCallback, useContext, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useaddFavoriteMSWalletMutation} from 'hooks/useFavoritedDaos';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {CreateMSWalletFormData} from '../pages/createMSWallet';
import {trackEvent} from 'services/analytics';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';

type CreateMSWalletContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePublishDao: () => void;
};

const CreateMSWalletContext = createContext<CreateMSWalletContextType | null>(
  null
);

declare type CreateWalletParams = {
  name: string;
  description: string;
  members: string[];
  required: number;
};

const CreateMSWalletProvider: React.FC = ({children}) => {
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isOnWrongNetwork, provider} = useWallet();
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {getValues} = useFormContext<CreateMSWalletFormData>();
  const {client} = useClient();

  const addFavoriteMSWalletMutation = useaddFavoriteMSWalletMutation();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();
  const [msWalletCreationData, setMSWalletCreationData] =
    useState<CreateWalletParams>();
  const [showModal, setShowModal] = useState(false);
  const [msWalletAddress, setDaoAddress] = useState('');

  const shouldPoll =
    msWalletCreationData !== undefined &&
    creationProcessState === TransactionState.WAITING;

  const disableActionButton =
    !msWalletCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePublishDao = async () => {
    setCreationProcessState(TransactionState.WAITING);
    setShowModal(true);
    const creationParams = await getMSWalletSettings();
    setMSWalletCreationData(creationParams);
  };

  // Handler for modal button click
  const handleExecuteCreation = async () => {
    // if DAO has been created, we don't need to do anything do not execute it
    // again, close the modal
    // trackEvent('daoCreation_publishDAONow_clicked', {
    //   network: getValues('blockchain')?.network,
    // });

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !msWalletCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      //console.log('Transaction is running');
      return;
    }

    // if the wallet was in a wrong network user will see the wrong network warning
    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    // proceed with creation if transaction is waiting or was not successfully executed (retry);
    await createMSWallet();
  };

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Dashboard, {
            network: network,
            msWallet: msWalletAddress,
          })
        );
        break;
      default: {
        setShowModal(false);
      }
    }
  };

  // Get msWallet setting configuration for creation process
  const getMSWalletSettings =
    useCallback(async (): Promise<CreateWalletParams> => {
      const {
        blockchain,
        walletName,
        walletSummary,
        multisigWallets,
        multisigMinimumApprovals,
      } = getValues();

      return {
        name: walletName,
        description: walletSummary,
        members: multisigWallets.map(wallet => wallet.address),
        required: multisigMinimumApprovals,
      };
    }, [getValues]);

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    if (msWalletCreationData === undefined) {
      return {
        average: BigInt(1500000000),
        max: BigInt(1500000000),
      };
    }
    return client?.estimation.create(
      msWalletCreationData.name,
      msWalletCreationData.description,
      msWalletCreationData.members,
      msWalletCreationData.required,
      1
    );
  }, [client?.estimation, msWalletCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  // run msWallet creation transaction
  const createMSWallet = async () => {
    setCreationProcessState(TransactionState.LOADING);

    // Check if SDK initialized properly
    if (!client || !msWalletCreationData) {
      throw new Error('SDK client is not initialized correctly');
    }
    const createIterator = client?.multiSigWalletFactory.create(
      msWalletCreationData.name,
      msWalletCreationData.description,
      msWalletCreationData.members,
      msWalletCreationData.required,
      1
    );

    // Check if createMSWalletIterator function is initialized
    if (!createIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      for await (const step of createIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            //console.log(step.txHash);
            // trackEvent('daoCreation_transaction_signed', {
            //   network: getValues('blockchain')?.network,
            // });
            break;
          case NormalSteps.SUCCESS:
            console.log(
              'Newly created DAO address',
              step.address.toLowerCase()
            );
            trackEvent('daoCreation_transaction_success', {
              network: getValues('blockchain')?.network,
              wallet_provider: provider?.connection.url,
            });
            setMSWalletCreationData(undefined);
            setCreationProcessState(TransactionState.SUCCESS);
            setDaoAddress(step.address.toLowerCase());

            try {
              await Promise.all([
                addFavoriteMSWalletMutation.mutateAsync({
                  msWallet: {
                    address: step.address.toLocaleLowerCase(),
                    chain: CHAIN_METADATA[network].id,
                    metadata: {
                      name: msWalletCreationData.name,
                      description: msWalletCreationData.description,
                    },
                  },
                }),
              ]);
            } catch (error) {
              console.warn(
                'Error favoriting and adding newly created DAO to cache',
                error
              );
            }
            break;
        }
      }
    } catch (err) {
      // unsuccessful execution, keep creation data for retry
      console.log(err);
      // trackEvent('daoCreation_transaction_failed', {
      //   network: getValues('blockchain')?.network,
      //   wallet_provider: provider?.connection.url,
      //   err,
      // });
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <CreateMSWalletContext.Provider value={{handlePublishDao}}>
      {children}
      <PublishModal
        subtitle={t('TransactionModal.publishMSWSubtitle')}
        buttonLabelSuccess={t('TransactionModal.launchMSWDashboard')}
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        disabledCallback={disableActionButton}
      />
    </CreateMSWalletContext.Provider>
  );
};

function useCreateMSWalletContext(): CreateMSWalletContextType {
  return useContext(CreateMSWalletContext) as CreateMSWalletContextType;
}

export {useCreateMSWalletContext, CreateMSWalletProvider};
