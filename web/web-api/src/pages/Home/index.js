import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Row, Typography } from '@douyinfe/semi-ui';
import {
  API,
  isAdmin,
  showError,
  showNotice,
  timestamp2string,
} from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import {
  IconHome,
  IconInfoCircle,
  IconCode,
  IconClock,
  IconSetting,
  IconHistogram,
  IconKey,
  IconCreditCard,
  IconGift,
} from '@douyinfe/semi-icons';
import './Home.css';

const { Text } = Typography;

const Home = () => {
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

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
      setHomePageContent('Failed to load content');
    }
    setHomePageContentLoaded(true);
  };

  const loadDashboardData = async () => {
    try {
      const res = await API.get('/api/user/dashboard');
      const { success, data } = res.data;
      if (success && data) {
        setDashboardData(data);
      }
    } catch (error) {
      console.warn('获取仪表盘数据失败:', error.message);
    }
  };

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return statusState.status ? timestamp2string(timestamp) : '';
  };

  const formatQuota = (quota, quotaPerUnit) => {
    if (!quotaPerUnit || quotaPerUnit === 0) {
      quotaPerUnit = 500000;
    }
    return (quota / quotaPerUnit).toFixed(4);
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
    loadDashboardData().then();
  }, []);

  if (!homePageContentLoaded) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <Text type='tertiary' className='loading-text'>
            加载中...
          </Text>
        </div>
      </div>
    );
  }

  if (homePageContent !== '') {
    return (
      <div className='home-content-container animate-fadeInUp'>
        {homePageContent.startsWith('https://') ? (
          <iframe
            src={homePageContent}
            className='home-iframe'
            title='Home Content'
          />
        ) : (
          <Card className='home-content-card'>
            <div
              className='home-markdown-content'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            ></div>
          </Card>
        )}
      </div>
    );
  }

  const status = statusState?.status;

  return (
    <div className='home-dashboard'>
      {/* 欢迎横幅 */}
      <div className='welcome-section animate-fadeInUp'>
        <div className='welcome-card glass-card'>
          <div className='welcome-content'>
            <div className='welcome-text'>
              <h1 className='welcome-title'>
                <span className='wave-emoji'>👋</span>
                欢迎使用 {status?.system_name || 'One API'}
              </h1>
              <p className='welcome-description'>
                OpenAI 接口聚合与管理系统，支持多种渠道包括
                Azure，适用于密钥的二次分发管理。
              </p>
            </div>
            <div className='welcome-decoration'>
              <div className='decoration-circle circle-1'></div>
              <div className='decoration-circle circle-2'></div>
              <div className='decoration-circle circle-3'></div>
            </div>
          </div>
        </div>
      </div>

      {/* 仪表盘区域 */}
      <div className='dashboard-section animate-fadeInUp delay-100'>
        <div className='dashboard-header'>
          <h1 className='dashboard-title'>仪表盘</h1>
          <p className='dashboard-subtitle'>
            欢迎使用 {status?.system_name || 'One API'} - 官方渠道，稳定、高速！
          </p>
        </div>
        <div className='stats-section'>
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} md={6}>
              <div className='stat-card'>
                <div className='stat-card-content'>
                  <div className='stat-label'>总请求数</div>
                  <div className='stat-value'>
                    {dashboardData?.monthly_request || 0}
                  </div>
                  <div className='stat-period'>本月</div>
                </div>
                <div className='stat-icon-wrapper stat-icon-primary'>
                  <IconHistogram />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className='stat-card'>
                <div className='stat-card-content'>
                  <div className='stat-label'>总 Token 数</div>
                  <div className='stat-value'>
                    {dashboardData?.monthly_token || 0}
                  </div>
                  <div className='stat-period'>本月</div>
                </div>
                <div className='stat-icon-wrapper stat-icon-secondary'>
                  <IconKey />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className='stat-card'>
                <div className='stat-card-content'>
                  <div className='stat-label'>总消耗</div>
                  <div className='stat-value'>
                    $
                    {formatQuota(
                      dashboardData?.used_quota || 0,
                      dashboardData?.quota_per_unit
                    )}
                  </div>
                  <div className='stat-period'>本月</div>
                </div>
                <div className='stat-icon-wrapper stat-icon-success'>
                  <IconCreditCard />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className='stat-card'>
                <div className='stat-card-content'>
                  <div className='stat-label'>账户余额</div>
                  <div className='stat-value stat-value-balance'>
                    $
                    {formatQuota(
                      dashboardData?.quota || 0,
                      dashboardData?.quota_per_unit
                    )}
                  </div>
                  <div className='stat-period'>可用</div>
                </div>
                <div className='stat-icon-wrapper stat-icon-warning'>
                  <IconGift />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 项目信息 */}
      <div className='project-info-section animate-fadeInUp delay-200'>
        <div className='section-header'>
          <IconInfoCircle className='section-header-icon' />
          <span>项目信息</span>
        </div>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={8}>
            <div className='info-stat-card'>
              <div className='info-stat-icon-wrapper info-stat-icon-primary'>
                <IconInfoCircle size='large' />
              </div>
              <div className='info-stat-content'>
                <div className='info-stat-label'>系统名称</div>
                <div className='info-stat-value'>
                  {status?.system_name || 'One API'}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className='info-stat-card'>
              <div className='info-stat-icon-wrapper info-stat-icon-secondary'>
                <IconCode size='large' />
              </div>
              <div className='info-stat-content'>
                <div className='info-stat-label'>版本号</div>
                <div className='info-stat-value'>
                  {status?.version || 'unknown'}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className='info-stat-card'>
              <div className='info-stat-icon-wrapper info-stat-icon-success'>
                <IconClock size='large' />
              </div>
              <div className='info-stat-content'>
                <div className='info-stat-label'>启动时间</div>
                <div className='info-stat-value info-stat-value-small'>
                  {getStartTimeString()}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 快速操作 */}
      <div className='quick-actions animate-fadeInUp delay-300'>
        <div className='section-header'>
          <IconSetting className='section-header-icon' />
          <span>快速操作</span>
        </div>
        <div className='actions-grid'>
          <a href='/token' className='action-item'>
            <div className='action-icon action-icon-primary'>
              <IconCode />
            </div>
            <div className='action-title'>令牌管理</div>
            <div className='action-desc'>管理您的 API 令牌</div>
          </a>
          {isAdmin() && (
            <a href='/channel' className='action-item'>
              <div className='action-icon action-icon-secondary'>
                <IconHome />
              </div>
              <div className='action-title'>渠道管理</div>
              <div className='action-desc'>配置 API 渠道</div>
            </a>
          )}
          <a href='/setting' className='action-item'>
            <div className='action-icon action-icon-success'>
              <IconSetting />
            </div>
            <div className='action-title'>系统设置</div>
            <div className='action-desc'>系统参数配置</div>
          </a>
          <a href='/log' className='action-item'>
            <div className='action-icon action-icon-warning'>
              <IconClock />
            </div>
            <div className='action-title'>日志查看</div>
            <div className='action-desc'>查看系统日志</div>
          </a>
        </div>
        <div tyle={{ textAlign: 'center', margin: '10px 0' }}>
          <p className='dashboard-subtitle'>web-api</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
