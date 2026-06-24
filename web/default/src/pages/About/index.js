import React from 'react';
import { useTranslation } from 'react-i18next';
import { getSystemName } from '../../helpers';

const About = () => {
  const { t } = useTranslation();
  const systemName = getSystemName();

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='info circle icon' style={{ color:'var(--primary)' }}></i>
            {t('about.title')}
          </span>
        </div>
        <div className='modern-card-body' style={{ lineHeight:2, fontSize:'15px', color:'var(--gray-600)' }}>
          <p>{t('about.description') || 'One API is an OpenAI API aggregation & management system.'}</p>
          <p>
            <a href='https://github.com/songquanpeng/one-api' target='_blank' rel='noopener noreferrer' style={{ color:'var(--primary)' }}>
              GitHub
            </a>
          </p>
          <p>{systemName} {process.env.REACT_APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
