import React from 'react';
import {Meta, Story} from '@storybook/react';

import {ListItemDao, ListItemDaoProps} from '../src/components/listItem';
import {useState} from '@storybook/addons';

export default {
  title: 'Components/ListItem/Dao',
  component: ListItemDao,
} as Meta;

const Template: Story<{daos: ListItemDaoProps[]}> = args => {
  const [selected, setSelected] = useState(args.daos[1].walletName);

  return (
    <div className="space-y-2">
      <p>Selected item: {selected}</p>
      {args.daos.map((msWallet, index) => (
        <ListItemDao
          key={index}
          {...msWallet}
          selected={selected === msWallet.walletName}
          onClick={() => setSelected(msWallet.walletName)}
        />
      ))}
    </div>
  );
};

export const Dao = Template.bind({});
Dao.args = {
  daos: [
    {
      walletName: 'Bushido DAO',
      msWalletAddress: 'bushido.msWallet.eth',
    },
    {
      walletName: 'Patito DAO',
      msWalletAddress: 'patito.msWallet.eth',
    },
  ],
};
