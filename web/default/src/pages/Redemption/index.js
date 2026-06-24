import React from 'react';
import RedemptionsTable from '../../components/RedemptionsTable';
import { useTranslation } from 'react-i18next';

const Redemption = () => {
  const { t } = useTranslation();

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='dollar sign icon' style={{ color:'var(--primary)' }}></i>
            {t('redemption.title')}
          </span>
        </div>
        <div className='modern-card-body'>
          <RedemptionsTable />
        </div>
      </div>
    </div>
  );
};

export default Redemption;
