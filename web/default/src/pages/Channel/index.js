import React from 'react';
import ChannelsTable from '../../components/ChannelsTable';
import { useTranslation } from 'react-i18next';

const Channel = () => {
  const { t } = useTranslation();

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='sitemap icon' style={{ color:'var(--primary)' }}></i>
            {t('channel.title')}
          </span>
        </div>
        <div className='modern-card-body'>
          <ChannelsTable />
        </div>
      </div>
    </div>
  );
};

export default Channel;
