import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../context/User';
import { API, getLogo, showError, showInfo, showSuccess } from '../helpers';
import { onGitHubOAuthClicked } from './utils';
import Turnstile from 'react-turnstile';
import { Button, Card, Divider, Form, Icon, Layout, Modal } from '@douyinfe/semi-ui';
import Title from '@douyinfe/semi-ui/lib/es/typography/title';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import TelegramLoginButton from 'react-telegram-login';
import { IconGithubLogo } from '@douyinfe/semi-icons';
import WeChatIcon from './WeChatIcon';
import './LoginForm.css';

const LoginForm = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    wechat_verification_code: ''
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const { username, password } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  let navigate = useNavigate();
  const [status, setStatus] = useState({});
  const logo = getLogo();

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError('未登录或登录已过期，请重新登录！');
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  }, []);

  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);

  const onWeChatLoginClicked = () => {
    setShowWeChatLoginModal(true);
  };

  const onSubmitWeChatVerificationCode = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    const res = await API.get(
      `/api/oauth/wechat?code=${inputs.wechat_verification_code}`
    );
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
      showSuccess('登录成功！');
      setShowWeChatLoginModal(false);
    } else {
      showError(message);
    }
  };

  function handleChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setSubmitted(true);
    try {
      if (username && password) {
        const res = await API.post(`/api/user/login?turnstile=${turnstileToken}`, {
          username,
          password
        });
        const { success, message, data } = res.data;
        if (success) {
          userDispatch({ type: 'login', payload: data });
          localStorage.setItem('user', JSON.stringify(data));
          showSuccess('登录成功！');
          if (username === 'root' && password === '123456') {
            Modal.error({ title: '您正在使用默认密码！', content: '请立刻修改默认密码！', centered: true });
          }
          navigate('/token');
        } else {
          showError(message);
          setSubmitted(false);  // 登录失败，重置按钮状态
        }
      } else {
        showError('请输入用户名和密码！');
        setSubmitted(false);  // 输入为空，重置按钮状态
      }
    } catch (error) {
      // 网络错误或其他异常，重置按钮状态
      setSubmitted(false);
    }
  }

  const onTelegramLoginClicked = async (response) => {
    const fields = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash', 'lang'];
    const params = {};
    fields.forEach((field) => {
      if (response[field]) {
        params[field] = response[field];
      }
    });
    const res = await API.get(`/api/oauth/telegram/login`, { params });
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      localStorage.setItem('user', JSON.stringify(data));
      showSuccess('登录成功！');
      navigate('/');
    } else {
      showError(message);
    }
  };

  return (
    <div className="login-page-modern">
      {/* 背景装饰 */}
      <div className="login-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* 主要登录卡片 */}
      <div className="login-container animate-fadeInUp">
        <div className="login-card glass">
          {/* Logo 和标题 */}
          <div className="login-header">
            <div className="login-logo">
              {logo ? (
                <img src={logo} alt="Logo" className="logo-image" />
              ) : (
                <div className="logo-placeholder">
                  <span className="gradient-text">One API</span>
                </div>
              )}
            </div>
            <h1 className="login-title">欢迎回来</h1>
            <p className="login-subtitle">登录以访问您的账户</p>
          </div>

          {/* 登录表单 */}
          <Form className="login-form">
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                type="text"
                className="input-modern"
                placeholder="请输入用户名"
                value={inputs.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                type="password"
                className="input-modern"
                placeholder="请输入密码"
                value={inputs.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-primary login-btn"
              onClick={handleSubmit}
              disabled={submitted}
            >
              {submitted ? (
                <span className="btn-loading">
                  <span className="animate-spin">⟳</span>
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </Form>

          {/* 链接 */}
          <div className="login-links">
            <Link to="/register" className="login-link">
              <span className="link-icon">+</span>
              注册新账户
            </Link>
            <Link to="/reset" className="login-link">
              <span className="link-icon">?</span>
              忘记密码
            </Link>
          </div>

          {/* 第三方登录 */}
          {status.github_oauth || status.wechat_login || status.telegram_oauth ? (
            <div className="social-login">
              <Divider align="center" className="social-divider">
                <span className="divider-text">或使用以下方式登录</span>
              </Divider>

              <div className="social-buttons">
                {status.github_oauth && (
                  <button
                    className="social-btn github-btn"
                    onClick={() => onGitHubOAuthClicked(status.github_client_id)}
                    title="GitHub 登录"
                  >
                    <IconGithubLogo />
                  </button>
                )}

                {status.wechat_login && (
                  <button
                    className="social-btn wechat-btn"
                    onClick={onWeChatLoginClicked}
                    title="微信登录"
                  >
                    <Icon svg={<WeChatIcon />} />
                  </button>
                )}

                {status.telegram_oauth && (
                  <div className="telegram-btn">
                    <TelegramLoginButton
                      dataOnauth={onTelegramLoginClicked}
                      botName={status.telegram_bot_name}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Turnstile 验证 */}
          {turnstileEnabled && (
            <div className="turnstile-container">
              <Turnstile
                sitekey={turnstileSiteKey}
                onVerify={(token) => setTurnstileToken(token)}
              />
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="login-footer">
          <Text type="tertiary">
            登录即表示您同意我们的{' '}
            <a href="#" className="footer-link">服务条款</a>
            {' '}和{' '}
            <a href="#" className="footer-link">隐私政策</a>
          </Text>
        </div>
      </div>

      {/* 微信登录模态框 */}
      <Modal
        title="微信扫码登录"
        visible={showWeChatLoginModal}
        maskClosable={true}
        onOk={onSubmitWeChatVerificationCode}
        onCancel={() => setShowWeChatLoginModal(false)}
        okText={'登录'}
        size={'small'}
        centered={true}
        className="wechat-modal"
      >
        <div className="wechat-qrcode-container">
          <img src={status.wechat_qrcode} alt="微信二维码" className="wechat-qrcode" />
        </div>
        <div className="wechat-instructions">
          <p>扫描二维码关注公众号</p>
          <p>输入「验证码」获取登录验证码</p>
          <p className="wechat-hint">（验证码三分钟内有效）</p>
        </div>
        <Form size="large" className="wechat-form">
          <Form.Input
            field={'wechat_verification_code'}
            placeholder="请输入验证码"
            label={'验证码'}
            value={inputs.wechat_verification_code}
            onChange={(value) => handleChange('wechat_verification_code', value)}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default LoginForm;
