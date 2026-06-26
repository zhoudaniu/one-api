import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/User';
import { StatusContext } from '../context/Status';

import { API, getLogo, getSystemName, isAdmin, isMobile, showError } from '../helpers';
import '../index.css';
import './SiderBar.css';

import {
  IconCalendarClock,
  IconComment,
  IconCreditCard,
  IconGift,
  IconHistogram,
  IconHome,
  IconImage,
  IconKey,
  IconLayers,
  IconSetting,
  IconUser,
  IconChevronLeft
} from '@douyinfe/semi-icons';
import { Layout, Nav } from '@douyinfe/semi-ui';

// HeaderBar Buttons

const SiderBar = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const defaultIsCollapsed = isMobile() || localStorage.getItem('default_collapse_sidebar') === 'true';

  let navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const systemName = getSystemName();
  const logo = getLogo();
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);

  const headerButtons = useMemo(() => [
    {
      text: '首页',
      itemKey: 'home',
      to: '/',
      icon: <IconHome />
    },
    {
      text: '渠道',
      itemKey: 'channel',
      to: '/channel',
      icon: <IconLayers />,
      className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle'
    },
    {
      text: '聊天',
      itemKey: 'chat',
      to: '/chat',
      icon: <IconComment />,
      className: localStorage.getItem('chat_link') ? 'semi-navigation-item-normal' : 'tableHiddle'
    },
    {
      text: '令牌',
      itemKey: 'token',
      to: '/token',
      icon: <IconKey />
    },
    {
      text: '兑换',
      itemKey: 'redemption',
      to: '/redemption',
      icon: <IconGift />,
      className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle'
    },
    {
      text: '充值',
      itemKey: 'topup',
      to: '/topup',
      icon: <IconCreditCard />
    },
    {
      text: '用户',
      itemKey: 'user',
      to: '/user',
      icon: <IconUser />,
      className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle'
    },
    {
      text: '日志',
      itemKey: 'log',
      to: '/log',
      icon: <IconHistogram />
    },
    {
      text: '数据看板',
      itemKey: 'detail',
      to: '/detail',
      icon: <IconCalendarClock />,
      className: localStorage.getItem('enable_data_export') === 'true' ? 'semi-navigation-item-normal' : 'tableHiddle'
    },
    {
      text: '绘图',
      itemKey: 'midjourney',
      to: '/midjourney',
      icon: <IconImage />,
      className: localStorage.getItem('enable_drawing') === 'true' ? 'semi-navigation-item-normal' : 'tableHiddle'
    },
    {
      text: '设置',
      itemKey: 'setting',
      to: '/setting',
      icon: <IconSetting />
    }
    // {
    //     text: '关于',
    //     itemKey: 'about',
    //     to: '/about',
    //     icon: <IconAt/>
    // }
  ], [localStorage.getItem('enable_data_export'), localStorage.getItem('enable_drawing'), localStorage.getItem('chat_link'), isAdmin()]);

  const loadStatus = async () => {
    try {
      const res = await API.get('/api/status');
      if (res && res.data) {
        const { success, data } = res.data;
        if (success) {
          localStorage.setItem('status', JSON.stringify(data));
          statusDispatch({ type: 'set', payload: data });
          localStorage.setItem('system_name', data.system_name);
          localStorage.setItem('logo', data.logo);
          localStorage.setItem('footer_html', data.footer_html);
          localStorage.setItem('quota_per_unit', data.quota_per_unit);
          localStorage.setItem('display_in_currency', data.display_in_currency);
          localStorage.setItem('enable_drawing', data.enable_drawing);
          localStorage.setItem('enable_data_export', data.enable_data_export);
          localStorage.setItem('data_export_default_time', data.data_export_default_time);
          localStorage.setItem('default_collapse_sidebar', data.default_collapse_sidebar);
          localStorage.setItem('mj_notify_enabled', data.mj_notify_enabled);
          if (data.chat_link) {
            localStorage.setItem('chat_link', data.chat_link);
          } else {
            localStorage.removeItem('chat_link');
          }
          if (data.chat_link2) {
            localStorage.setItem('chat_link2', data.chat_link2);
          } else {
            localStorage.removeItem('chat_link2');
          }
        } else {
          showError('无法正常连接至服务器！');
        }
      }
    } catch (error) {
      // API 请求失败，使用默认值
      console.error('加载状态失败:', error);
    }
  };

  useEffect(() => {
    loadStatus().then(() => {
      setIsCollapsed(isMobile() || localStorage.getItem('default_collapse_sidebar') === 'true');
    });
  }, []);

  const location = useLocation();

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/channel')) return 'channel';
    if (path.startsWith('/token')) return 'token';
    if (path.startsWith('/redemption')) return 'redemption';
    if (path.startsWith('/topup')) return 'topup';
    if (path.startsWith('/user')) return 'user';
    if (path.startsWith('/log')) return 'log';
    if (path.startsWith('/detail')) return 'detail';
    if (path.startsWith('/midjourney')) return 'midjourney';
    if (path.startsWith('/setting')) return 'setting';
    if (path.startsWith('/chat')) return 'chat';
    return 'home';
  };

  useEffect(() => {
    setSelectedKeys([getSelectedKey()]);
  }, [location.pathname]);

  return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo 区域 */}
      <div className="sidebar-logo">
        <img src={logo} alt="logo" />
        {!isCollapsed && <span className="sidebar-logo-text">{systemName}</span>}
      </div>

      {/* 导航菜单 */}
      <nav className="sidebar-nav">
        {headerButtons.map((item, index) => (
          <Link
            key={item.itemKey}
            to={item.to}
            className={`nav-item ${selectedKeys[0] === item.itemKey ? 'active' : ''} ${item.className || ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.text}</span>
            {isCollapsed && (
              <span className="nav-item-tooltip">{item.text}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* 底部折叠按钮 */}
      <div className="sidebar-footer">
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="collapse-icon">
            <IconChevronLeft />
          </span>
          {!isCollapsed && <span>收起侧边栏</span>}
        </button>
      </div>
    </div>
  );
};

export default SiderBar;
