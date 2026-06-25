import React, {useEffect, useState} from 'react';
import {API, showError, showSuccess} from '../../helpers';
import {renderNumber, renderQuota} from '../../helpers/render';
import { useTranslation } from 'react-i18next';

const TopUp = () => {
  const { t } = useTranslation();
  const [redemptionCode, setRedemptionCode] = useState('');
  const [userQuota, setUserQuota] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserQuota = async () => {
    let res = await API.get("/api/user/self");
    const {success, message, data} = res.data;
    if (success) {
      setUserQuota(data.quota);
    }
  };

  useEffect(() => {
    getUserQuota().then();
  }, []);

  const topUp = async () => {
    if (redemptionCode === '') return;
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', { key: redemptionCode });
      const {success, message, data} = res.data;
      if (success) {
        showSuccess(t('topup.success') + ': ' + renderQuota(data));
        setUserQuota(q => q + data);
        setRedemptionCode('');
      } else {
        showError(message);
      }
    } catch (err) {
      showError(t('topup.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:'24px', display:'flex', gap:'16px', alignItems:'center', background:'var(--primary-bg)', borderRadius:'var(--radius)', padding:'20px 24px' }}>
        <div className='stat-icon blue'><i className='dollar sign icon'></i></div>
        <div>
          <div style={{ fontSize:'13px', color:'var(--gray-500)' }}>{t('topup.balance') || 'Balance'}</div>
          <div className='stat-value'>{renderNumber(userQuota)} <small>{t('topup.points') || 'points'}</small></div>
        </div>
      </div>

      <div className='modern-card' style={{ marginBottom:'16px' }}>
        <div className='modern-card-header'>
          <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <i className='gift icon' style={{ color:'var(--primary)' }}></i>
            {t('topup.redeem') || 'Redeem Code'}
          </span>
        </div>
        <div className='modern-card-body'>
          <div style={{ display:'flex', gap:'12px', alignItems:'flex-end' }}>
            <div style={{ flex:1 }}>
              <label className='modern-form-label'>{t('topup.code') || 'Redemption Code'}</label>
              <input className='modern-input' value={redemptionCode} onChange={(e) => setRedemptionCode(e.target.value)} placeholder={t('topup.code_placeholder') || 'Enter redemption code'} />
            </div>
            <button className='modern-btn modern-btn-primary' onClick={topUp} disabled={isSubmitting} style={{ height:'40px', whiteSpace:'nowrap' }}>
              {isSubmitting ? (t('topup.redeeming') || 'Redeeming...') : (t('topup.redeem') || 'Redeem')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUp;
