import React from 'react';
import LogsTable from '../../components/LogsTable';
import { useTranslation } from 'react-i18next';

const Log = () => {
  const { t } = useTranslation();

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='book icon' style={{ color:'var(--primary)' }}></i>
            {t('log.title')}
          </span>
        </div>
        <div className='modern-card-body'>
          <LogsTable />
        </div>
      </div>
    </div>
  );
};

export default Log;
