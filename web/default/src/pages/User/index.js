import React from 'react';
import UsersTable from '../../components/UsersTable';
import { useTranslation } from 'react-i18next';

const User = () => {
  const { t } = useTranslation();

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='user icon' style={{ color:'var(--primary)' }}></i>
            {t('user.title')}
          </span>
        </div>
        <div className='modern-card-body'>
          <UsersTable />
        </div>
      </div>
    </div>
  );
};

export default User;
