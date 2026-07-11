import React, { useEffect, useState, useRef, useCallback } from 'react';
import { API, showError, showSuccess } from '../../helpers';
import { renderQuota } from '../../helpers/render';
import {
  Layout,
  Card,
  Button,
  Input,
  Typography,
  Space,
  Spin,
  Modal,
} from '@douyinfe/semi-ui';
import { QRCodeSVG } from 'qrcode.react';
import './TopUp.css';

const { Title, Text } = Typography;

const PRESET_AMOUNTS = [10, 20, 50, 100, 300, 500];

const TopUp = () => {
  const [userQuota, setUserQuota] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const timerRef = useRef(null);

  const getUserQuota = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message, data } = res.data;
      if (success) {
        setUserQuota(data.quota);
      } else {
        showError(message);
      }
    } catch (err) {
      showError('获取余额失败');
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const startCountdown = useCallback((expiredTime) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = expiredTime - now;
      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(timerRef.current);
        timerRef.current = null;
        return;
      }
      setCountdown(remaining);
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);
  }, []);

  useEffect(() => {
    getUserQuota();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleCustomAmountChange = (value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 100000) {
      setCustomAmount(value);
      setSelectedAmount(num);
    } else if (value === '') {
      setCustomAmount('');
      setSelectedAmount(null);
    }
  };

  const getAmount = () => {
    if (isCustom) {
      return parseInt(customAmount, 10) || 0;
    }
    return selectedAmount || 0;
  };

  const handleTopUp = async () => {
    const amount = getAmount();
    if (!amount || amount < 1) {
      showError('请选择或输入充值金额');
      return;
    }

    setLoading(true);
    try {
      // 直接调用外部钱包API，携带Cookie
      const walletRes = await fetch('http://api.smartlinking.ai/one-api/wallet/top-up/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
        body: JSON.stringify({ amount: amount })
      });
      const walletData = await walletRes.json();

      let orderData;
      if (walletData.code === 200 && walletData.data) {
        orderData = {
          order_id: null,
          amount: walletData.data.amount,
          address: walletData.data.address,
          expired_time: walletData.data.expired_time,
        };
      } else {
        showError(walletData.message || '创建订单失败');
        return;
      }
      setOrder(orderData);
      const expireTime = Math.floor(Date.now() / 1000) + orderData.expired_time;
      startCountdown(expireTime);
      showSuccess('订单创建成功，请扫码支付');
    } catch (err) {
      showError('创建订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (order?.address) {
      navigator.clipboard
        .writeText(order.address)
        .then(() => {
          showSuccess('地址已复制到剪贴板');
        })
        .catch(() => {
          showError('复制失败，请手动复制');
        });
    }
  };

  const handleCloseOrder = () => {
    setOrder(null);
    setCountdown(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const renderAmountSection = () => {
    if (order) {
      return (
        <div className='order-section'>
          <div className='order-header'>
            <Title level={4}>请扫码支付</Title>
            <Text type='danger' className='countdown'>
              剩余时间: {formatCountdown(countdown)}
            </Text>
          </div>

          <div className='qr-section'>
            <div className='qr-wrapper'>
              <QRCodeSVG
                value={order.address}
                size={200}
                level='H'
                includeMargin={true}
              />
            </div>
          </div>

          <div className='order-info'>
            <div className='info-row'>
              <Text type='secondary'>充值金额:</Text>
              <Text strong className='amount-highlight'>
                {order.amount} USDT
              </Text>
            </div>
            <div className='amount-warning'>
              ⚠️ 请务必转入精确金额 {order.amount} USDT，否则可能无法自动到账
            </div>
            <div className='info-row'>
              <Text type='secondary'>收款地址:</Text>
              <div className='address-box'>
                <Text
                  copyable={{ content: order.address }}
                  className='address-text'
                >
                  {order.address}
                </Text>
              </div>
            </div>
          </div>

          <div className='order-actions'>
            <Button type='secondary' onClick={handleCloseOrder}>
              取消订单
            </Button>
            <Button type='primary' onClick={handleCopyAddress}>
              复制地址
            </Button>
          </div>

          <div className='order-tips'>
            <Text type='secondary' size='small'>
              请在 {formatCountdown(countdown)} 内完成支付，超时订单将自动关闭
            </Text>
          </div>
        </div>
      );
    }

    return (
      <div className='amount-section'>
        <div className='amount-label'>支付金额</div>
        <div className='amount-grid'>
          {PRESET_AMOUNTS.map((amount) => (
            <div
              key={amount}
              className={`amount-item ${
                selectedAmount === amount && !isCustom ? 'active' : ''
              }`}
              onClick={() => handleSelectAmount(amount)}
            >
              ¥{amount}
            </div>
          ))}
          <div
            className={`amount-item custom ${isCustom ? 'active' : ''}`}
            onClick={handleCustomClick}
          >
            自定义
          </div>
        </div>

        {isCustom && (
          <div className='custom-input'>
            <input
              className='amount-input'
              placeholder='请输入 1 至 100000 元之间的金额'
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        )}

        <Button
          type='primary'
          theme='solid'
          block
          size='large'
          loading={loading}
          disabled={!selectedAmount}
          onClick={handleTopUp}
          className='topup-button'
        >
          立即充值
        </Button>
      </div>
    );
  };

  return (
    <div className='topup-container'>
      <Layout>
        <Layout.Header>
          <h3>充值</h3>
        </Layout.Header>
        <Layout.Content>
          <div className='topup-content'>
            <Card className='topup-card'>
              <div className='balance-section'>
                <Text type='secondary'>当前余额</Text>
                <Title level={2} className='balance-value'>
                  {renderQuota(userQuota)}
                  <div className='balance-style'></div>
                </Title>
              </div>

              {renderAmountSection()}
            </Card>
          </div>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default TopUp;
