import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import React, {useCallback, useMemo, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

// import DateTimeSelector from 'containers/dateTimeSelector';
// import Duration, {DurationLabel} from 'containers/duration';
import UtcMenu from 'containers/utcMenu';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {
  MINS_IN_DAY,
  MULTISIG_MAX_REC_DURATION_DAYS,
  MULTISIG_MIN_DURATION_HOURS,
  MULTISIG_REC_DURATION_DAYS,
} from 'utils/constants';
import {
  daysToMills,
  getFormattedUtcOffset,
  hoursToMills,
  minutesToMills,
} from 'utils/date';
import {FormSection} from '.';
import {DateTimeErrors} from './dateTimeErrors';

const MAX_DURATION_MILLS =
  MULTISIG_MAX_REC_DURATION_DAYS * MINS_IN_DAY * 60 * 1000;

export type UtcInstance = 'first' | 'second';

const SetupMultisigVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const {control, formState, getValues, resetField, setValue, trigger} =
    useFormContext();

  const [endTimeWarning, startSwitch, durationSwitch] = useWatch({
    control,
    name: ['endTimeWarning', 'startSwitch', 'durationSwitch'],
  });

  const startItems = [
    {label: t('labels.now'), selectValue: 'now'},
    {
      label: t('labels.dateTime'),
      selectValue: 'date',
    },
  ];

  const expirationItems = [
    {
      label: t('labels.duration'),
      selectValue: 'duration',
    },
    {
      label: t('labels.dateTime'),
      selectValue: 'date',
    },
  ];

  const durationAlerts = {
    minDuration: t('alert.multisig.proposalMinDuration'),
    maxDuration: t('alert.multisig.proposalMaxDuration'),
    acceptableDuration: t('alert.multisig.accepTableProposalDuration'),
  };

  const minDurationMills = hoursToMills(MULTISIG_MIN_DURATION_HOURS);

  const currTimezone = useMemo(
    () => timezones.find(tz => tz === getFormattedUtcOffset()) || timezones[13],
    []
  );

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') setValue('startUtc', tz);
    else setValue('endUtc', tz);

    trigger('startDate');
  };

  // clears duration fields for end date
  const resetDuration = useCallback(() => {
    resetField('durationDays');
    resetField('durationHours');
    resetField('durationMinutes');
    resetField('endTimeWarning');
  }, [resetField]);

  // clears specific date time fields for start date
  const resetStartDate = useCallback(() => {
    resetField('startDate');
    resetField('startTime');
    resetField('startUtc');
    resetField('startTimeWarning');
  }, [resetField]);

  // clears specific date time fields for end date
  const resetEndDate = useCallback(() => {
    resetField('endDate');
    resetField('endTime');
    resetField('endUtc');
    resetField('endTimeWarning');
  }, [resetField]);

  // handles the toggling between start time options
  const handleStartToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);
      if (changeValue === 'now') resetStartDate();
      else setValue('startUtc', currTimezone);
    },
    [currTimezone, resetStartDate, setValue]
  );

  // handles the toggling between end time options
  const handleEndToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);

      if (changeValue === 'duration') resetEndDate();
      else {
        resetDuration();
        setValue('endUtc', currTimezone);
      }
    },
    [currTimezone, resetDuration, resetEndDate, setValue]
  );

  // get the current proposal duration set by the user
  const getDuration = useCallback(() => {
    if (getValues('durationSwitch') === 'duration') {
      const [days, hours, mins] = getValues([
        'durationDays',
        'durationHours',
        'durationMinutes',
      ]);

      return daysToMills(days) + hoursToMills(hours) + minutesToMills(mins);
    } else {
      return (
        Number(getValues('durationMills')) ||
        daysToMills(MULTISIG_REC_DURATION_DAYS)
      );
    }
  }, [getValues]);

  // handles opening the utc menu and setting the correct instance
  const handleUtcClicked = useCallback(
    (instance: UtcInstance) => {
      setUtcInstance(instance);
      open('utc');
    },
    [open]
  );

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <>
      {/* Voting Type Selection  */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.optionLabel.title')}
          helpText={t('newWithdraw.setupVoting.multisig.optionDescription')}
        />
        <CheckboxListItem
          label={t('newWithdraw.setupVoting.multisig.votingOption.label')}
          type="active"
          helptext={t(
            'newWithdraw.setupVoting.multisig.votingOption.description'
          )}
          multiSelect={false}
        />
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.multisig.votingOption.alert')}
        />
      </FormSection>



      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default SetupMultisigVotingForm;

type Props = {
  items: Array<{
    label: string;
    selectValue: string | boolean;
  }>;

  value: string;
  onChange: (value: string | boolean) => void;
};

export const ToggleCheckList: React.FC<Props> = ({onChange, items, value}) => {
  return (
    <ToggleCheckListContainer>
      {items.map(item => (
        <ToggleCheckListItemWrapper key={item.label}>
          <CheckboxListItem
            label={item.label}
            multiSelect={false}
            onClick={() => onChange(item.selectValue)}
            type={value === item.selectValue ? 'active' : 'default'}
          />
        </ToggleCheckListItemWrapper>
      ))}
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-1.5 desktop:flex-row desktop:gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;
