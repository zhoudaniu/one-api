import React, { useState } from 'react';
import { Card } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import SystemSetting from '../../components/SystemSetting';
import OtherSetting from '../../components/OtherSetting';
import PersonalSetting from '../../components/PersonalSetting';
import OperationSetting from '../../components/OperationSetting';

const Setting = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { key: 'system', label: t('setting.system'), icon: 'cog' },
    { key: 'personal', label: t('setting.personal'), icon: 'user' },
    { key: 'operation', label: t('setting.operation'), icon: 'play' },
    { key: 'other', label: t('setting.other'), icon: 'ellipsis horizontal' },
  ];

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='setting icon' style={{ color:'var(--primary)' }}></i>
            {t('setting.title')}
          </span>
        </div>
        <div style={{ display:'flex', gap:'4px', padding:'0 24px', borderBottom:'1px solid var(--gray-100)' }}>
          {tabs.map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={'nav-btn ' + (activeTab === tab.key ? 'active' : '')}
              style={{ borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent', borderRadius:0, padding:'12px 16px' }}>
              <i className={tab.icon + ' icon'}></i>
              {tab.label}
            </button>
          ))}
        </div>
        <div className='modern-card-body'>
          {activeTab === 'system' && <SystemSetting />}
          {activeTab === 'personal' && <PersonalSetting />}
          {activeTab === 'operation' && <OperationSetting />}
          {activeTab === 'other' && <OtherSetting />}
        </div>
      </div>
    </div>
  );
};

export default Setting;
