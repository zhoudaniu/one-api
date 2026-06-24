import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Grid, Header } from 'semantic-ui-react';
import { API, showError, showNotice, timestamp2string } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { UserContext } from '../../context/User';
import { Link } from 'react-router-dom';

const Home = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [userState] = useContext(UserContext);

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
      setHomePageContent(t('home.loading_failed'));
    }
    setHomePageContentLoaded(true);
  };

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return timestamp2string(timestamp);
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  if (!homePageContentLoaded) {
    return <div className='modern-container' style={{ textAlign:'center', padding:'80px 0', color:'var(--gray-400)' }}>{t('home.loading') || 'Loading...'}</div>;
  }

  if (homePageContent !== '') {
    return (
      <div className='modern-container' style={{ paddingTop:'20px' }}>
        {homePageContent.startsWith('https://') ? (
          <iframe src={homePageContent} style={{ width:'100%', height:'calc(100vh - 120px)', border:'none', borderRadius:'var(--radius)' }} />
        ) : (
          <div className='modern-card'>
            <div className='modern-card-body' style={{ fontSize:'larger' }} dangerouslySetInnerHTML={{ __html: homePageContent }}></div>
          </div>
        )}
      </div>
    );
  }

  const status = statusState?.status;
  const configItems = [
    { label: t('home.system_status.config.email_verify'), value: status?.email_verification, icon: 'envelope' },
    { label: t('home.system_status.config.github_oauth'), value: status?.github_oauth, icon: 'github' },
    { label: t('home.system_status.config.wechat_login'), value: status?.wechat_login, icon: 'wechat' },
    { label: t('home.system_status.config.turnstile'), value: status?.turnstile_check, icon: 'shield alternate' },
  ];

  return (
    <div className='modern-container' style={{ paddingTop:'20px' }}>
      {/* ª∂”≠ø®∆¨ */}
      <div className='modern-card' style={{ marginBottom:'24px', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'#fff', border:'none' }}>
        <div className='modern-card-body' style={{ padding:'32px 28px' }}>
          <h2 style={{ margin:'0 0 8px', fontSize:'22px', fontWeight:700 }}>{t('home.welcome.title')}</h2>
          <p style={{ margin:0, opacity:0.9, lineHeight:1.7, fontSize:'15px' }}>{t('home.welcome.description')}</p>
          {!userState.user && (
            <div style={{ marginTop:'16px' }}>
              <Link to='/login' className='modern-btn modern-btn-primary' style={{ background:'rgba(255,255,255,0.2)', color:'#fff', backdropFilter:'blur(8px)' }}>
                {t('home.welcome.login_notice')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Õ≥º∆ø®∆¨ */}
      <div className='stat-grid'>
        <div className='stat-card'>
          <div className='stat-icon blue'><i className='info circle icon'></i></div>
          <div className='stat-info'>
            <div className='stat-label'>{t('home.system_status.info.name')}</div>
            <div className='stat-value'>{status?.system_name || 'One API'}</div>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon purple'><i className='code branch icon'></i></div>
          <div className='stat-info'>
            <div className='stat-label'>{t('home.system_status.info.version')}</div>
            <div className='stat-value'>{status?.version || 'unknown'}</div>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon green'><i className='clock icon'></i></div>
          <div className='stat-info'>
            <div className='stat-label'>{t('home.system_status.info.start_time')}</div>
            <div className='stat-value' style={{ fontSize:'18px' }}>{getStartTimeString()}</div>
          </div>
        </div>
      </div>

      {/* ≈‰÷√◊¥Ã¨ */}
      <div className='modern-card'>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='cog icon'></i>
            {t('home.system_status.config.title') || 'Configuration'}
          </span>
        </div>
        <div className='modern-card-body'>
          <Grid columns={2} stackable>
            {configItems.map((item, idx) => (
              <Grid.Column key={idx}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--gray-100)' }}>
                  <span style={{ color:'var(--gray-600)', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
                    <i className={item.icon + ' icon'}></i>
                    {item.label}
                  </span>
                  <span className={item.value ? 'modern-badge modern-badge-success' : 'modern-badge modern-badge-danger'}>
                    {item.value ? t('home.system_status.config.enabled') : t('home.system_status.config.disabled')}
                  </span>
                </div>
              </Grid.Column>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default Home;
