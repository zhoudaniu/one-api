import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  Image,
  Message,
  Modal,
} from 'semantic-ui-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/User';
import { API, getLogo, showError, showSuccess, showWarning } from '../helpers';
import { onGitHubOAuthClicked, onLarkOAuthClicked } from './utils';
import larkIcon from '../images/lark.svg';

const LoginForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    wechat_verification_code: '',
  });
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const { username, password } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();
  const [status, setStatus] = useState({});
  const logo = getLogo();

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('messages.error.login_expired'));
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
    }
  }, []);

  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);

  const onWeChatLoginClicked = () => {
    setShowWeChatLoginModal(true);
  };

  const onSubmitWeChatVerificationCode = async () => {
    const res = await API.get(
      "/api/oauth/wechat?code=" + inputs.wechat_verification_code
    );
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
      showSuccess(t('messages.success.login'));
      setShowWeChatLoginModal(false);
    } else {
      showError(message);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    setSubmitted(true);
    if (username && password) {
      const res = await API.post("/api/user/login", {
        username,
        password,
      });
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        if (username === 'root' && password === '123456') {
          navigate('/user/edit');
          showSuccess(t('messages.success.login'));
          showWarning(t('messages.error.root_password'));
        } else {
          navigate('/token');
          showSuccess(t('messages.success.login'));
        }
      } else {
        showError(message);
      }
    }
  }

  return (
    <div className='login-page'>
      <div className='login-card'>
        {logo && <img src={logo} alt='logo' style={{ width:48, height:48, borderRadius:12, margin:'0 auto 12px', display:'block' }} />}
        <h2>{t('auth.login.title')}</h2>
        <p className='subtitle'>{t('auth.login.subtitle') || 'Sign in to your account'}</p>

        <Form size='large' onSubmit={handleSubmit}>
          <div className='modern-form-group'>
            <label className='modern-form-label'>{t('auth.login.username')}</label>
            <input
              className='modern-input'
              placeholder={t('auth.login.username')}
              name='username'
              value={username}
              onChange={handleChange}
            />
          </div>
          <div className='modern-form-group'>
            <label className='modern-form-label'>{t('auth.login.password')}</label>
            <input
              className='modern-input'
              placeholder={t('auth.login.password')}
              name='password'
              type='password'
              value={password}
              onChange={handleChange}
            />
          </div>
          <button
            className='modern-btn modern-btn-primary'
            style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:'15px', marginBottom:'20px' }}
            onClick={handleSubmit}
          >
            {t('auth.login.button')}
          </button>
        </Form>

        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'16px' }}>
          <span>
            {t('auth.login.forgot_password')}
            <Link to='/reset' style={{ color:'var(--primary)', marginLeft:'4px' }}>{t('auth.login.reset_password')}</Link>
          </span>
          <span>
            {t('auth.login.no_account')}
            <Link to='/register' style={{ color:'var(--primary)', marginLeft:'4px' }}>{t('auth.login.register')}</Link>
          </span>
        </div>

        {(status.github_oauth || status.wechat_login || status.lark_client_id) && (
          <>
            <Divider horizontal style={{ fontSize:'12px', color:'var(--gray-400)' }}>{t('auth.login.other_methods')}</Divider>
            <div style={{ display:'flex', justifyContent:'center', gap:'12px', marginTop:'16px' }}>
              {status.github_oauth && (
                <Button circular color='black' icon='github' onClick={() => onGitHubOAuthClicked(status.github_client_id)} />
              )}
              {status.wechat_login && (
                <Button circular color='green' icon='wechat' onClick={onWeChatLoginClicked} />
              )}
              {status.lark_client_id && (
                <div style={{ background:'radial-gradient(circle, #FFFFFF, #FFFFFF)', width:36, height:36, borderRadius:'10em', display:'flex', cursor:'pointer' }}
                  onClick={() => onLarkOAuthClicked(status.lark_client_id)}>
                  <Image src={larkIcon} avatar style={{ width:36, height:36, cursor:'pointer', margin:'auto' }} />
                </div>
              )}
            </div>
          </>
        )}

        <Modal onClose={() => setShowWeChatLoginModal(false)} open={showWeChatLoginModal} size={'mini'}>
          <Modal.Content>
            <Image src={status.wechat_qrcode} fluid />
            <p style={{ textAlign:'center', margin:'12px 0' }}>{t('auth.login.wechat.scan_tip')}</p>
            <Form>
              <input className='modern-input' placeholder={t('auth.login.wechat.code_placeholder')} name='wechat_verification_code' value={inputs.wechat_verification_code} onChange={handleChange} style={{ marginBottom:'12px' }} />
              <button className='modern-btn modern-btn-primary' style={{ width:'100%', justifyContent:'center' }} onClick={onSubmitWeChatVerificationCode}>{t('auth.login.button')}</button>
            </Form>
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
};

export default LoginForm;
