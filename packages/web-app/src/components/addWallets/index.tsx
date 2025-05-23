import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  ListItemAction,
} from '@aragon/ui-components';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useAlertContext} from 'context/alert';
import {useWallet} from 'hooks/useWallet';
import Footer from './footer';
import Header from './header';
import Row from './row';

const AddWallets: React.FC = () => {
  const {t} = useTranslation();
  const {address} = useWallet();

  const {control, setValue, resetField, trigger} = useFormContext();
  const wallets = useWatch({name: 'wallets', control: control});
  const {fields, append, remove} = useFieldArray({
    name: 'wallets',
    control,
  });
  const {alert} = useAlertContext();

  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...(wallets && {...wallets[index]}),
    };
  });

  useEffect(() => {
    if (address && !wallets) {
      // uncomment when minting to treasury is ready
      // insert(1, {address: address, amount: '0'});
      append({address, amount: 1});
    }
  }, [address, append, wallets]);

  const resetDistribution = () => {
    controlledFields.forEach((_, index) => {
      setValue(`wallets.${index}.amount`, 1);
    });
    trigger('wallets');
    resetField('eligibilityTokenAmount');
    alert(t('alert.chip.distributionReset'));
  };

  // setTimeout added because instant trigger not working
  const handleAddWallet = () => {
    append({address: '', ensName: '', amount: 1});
    setTimeout(() => {
      trigger(`wallets.${controlledFields.length}`);
    }, 50);
  };

  const handleDeleteRow = (index: number) => {
    remove(index);
    setTimeout(() => {
      trigger('wallets');
    });
  };

  return (
    <Container data-testid="add-wallets">
      <ListGroup>
        <Header />
        {controlledFields.map((field, index) => {
          return (
            <Row
              key={field.id}
              index={index}
              // Replace when minting to treasury is supported
              // {...(index !== 0 ? {onDelete: () => remove(index)} : {})}
              onDelete={handleDeleteRow}
            />
          );
        })}
        <Footer totalAddresses={fields.length || 0} />
      </ListGroup>
      <ActionsWrapper>
        <ButtonText
          label={t('labels.addWallet')}
          mode="secondary"
          size="large"
          onClick={handleAddWallet}
        />
        <Dropdown
          align="start"
          trigger={
            <ButtonIcon
              mode="ghost"
              size="large"
              bgWhite
              icon={<IconMenuVertical />}
              data-testid="trigger"
            />
          }
          sideOffset={8}
          listItems={[
            {
              component: (
                <ListItemAction title={t('labels.resetDistribution')} bgWhite />
              ),
              callback: resetDistribution,
            },
            {
              component: (
                <ListItemAction
                  title={t('labels.deleteAllAddresses')}
                  bgWhite
                />
              ),
              callback: () => {
                remove();
                setValue('tokenTotalSupply', 0);
                resetField('eligibilityTokenAmount');
                alert(t('alert.chip.removedAllAddresses'));
              },
            },
          ]}
        />
      </ActionsWrapper>
    </Container>
  );
};

export default AddWallets;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;

const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;
