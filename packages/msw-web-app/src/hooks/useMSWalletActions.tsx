import {useTranslation} from 'react-i18next';

import {ActionParameter, HookData} from 'utils/types';
import {useMSWalletQuery} from './useMSWalletDetails';

export function useMSWalletActions(
  msWallet: string
): HookData<ActionParameter[]> {
  const {error, isLoading} = useMSWalletQuery(msWallet);
  const multisig = true;

  const {t} = useTranslation();

  const baseActions: ActionParameter[] = [
    {
      type: 'withdraw_assets',
      title: t('TransferModal.item2Title'),
      subtitle: t('AddActionModal.withdrawAssetsSubtitle'),
      isReuseable: true,
    },
  ];

  const multisigActions = [
    {
      type: 'add_address',
      title: t('AddActionModal.addAddresses'),
      subtitle: t('AddActionModal.addAddressesSubtitle'),
    },
    {
      type: 'remove_address',
      title: t('AddActionModal.removeAddresses'),
      subtitle: t('AddActionModal.removeAddressesSubtitle'),
    },
  ].concat(baseActions) as ActionParameter[];

  return {
    data: multisig ? multisigActions : multisigActions,
    isLoading,
    error: error as Error,
  };
}
