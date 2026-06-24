import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFooterHTML, getSystemName } from '../helpers';

const Footer = () => {
  const { t } = useTranslation();
  const systemName = getSystemName();
  const [footer, setFooter] = useState(getFooterHTML());
  let remainCheckTimes = 5;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) setFooter(footer_html);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainCheckTimes <= 0) { clearInterval(timer); return; }
      remainCheckTimes--;
      loadFooter();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='modern-footer'>
      {footer ? (
        <div className='custom-footer' dangerouslySetInnerHTML={{ __html: footer }}></div>
      ) : (
        <div>
          <a href='https://github.com/songquanpeng/one-api' target='_blank' rel='noopener noreferrer' style={{ color:'var(--gray-400)', textDecoration:'none' }}>
            {systemName} {process.env.REACT_APP_VERSION}
          </a>
          <span style={{ margin:'0 8px' }}>¡¤</span>
          <span>{t('footer.built_by')} </span>
          <a href='https://github.com/songquanpeng' target='_blank' rel='noopener noreferrer' style={{ color:'var(--primary)', textDecoration:'none' }}>
            {t('footer.built_by_name')}
          </a>
          <span style={{ margin:'0 8px' }}>¡¤</span>
          <a href='https://opensource.org/licenses/mit-license.php' target='_blank' rel='noopener noreferrer' style={{ color:'var(--gray-400)', textDecoration:'none' }}>
            {t('footer.mit')}
          </a>
        </div>
      )}
    </div>
  );
};

export default Footer;
