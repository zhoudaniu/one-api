import React from 'react';
import TokensTable from '../../components/TokensTable';
import { useTranslation } from 'react-i18next';

const Token = () => {
  const { t } = useTranslation();

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='key icon' style={{ color:'var(--primary)' }}></i>
            {t('token.title')}
          </span>
        </div>
        <div className='modern-card-body'>
          <TokensTable />
        </div>
      </div>
    </div>
  );
};

export default Token;
