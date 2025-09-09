import {useEffect, useState} from 'react';
import {HookData, MSWSetting, SupportedVotingSettings} from 'utils/types';
import {
  MultisigVotingSettings,
  PluginTypes,
  VotingSettings,
} from '../utils/aragon/types';
import {useClient} from './useClient';

export function isTokenVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is VotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return 'minDuration' in settings;
}

export function isMultisigVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is MultisigVotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return !('minDuration' in settings);
}

/**
 * Retrieves plugin governance settings from SDK
 * @param pluginAddress plugin from which proposals will be retrieved
 * @returns plugin governance settings
 */
export function usePluginSettings(
  pluginAddress: string,
): HookData<MSWSetting> {
  const [data, setData] = useState<MSWSetting>(
    {} as MSWSetting
  );
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {client} = useClient();

  useEffect(() => {
    async function getPluginSettings() {
      try {
        setIsLoading(true);

        const minApprovals = await client?.multiSigWallet.getRequired();
        const settings = {
          minApprovals: minApprovals,
          onlyListed: true,
        };
        if (settings) setData(settings as MSWSetting);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getPluginSettings();
  }, [pluginAddress]);

  return {data, error, isLoading};
}
