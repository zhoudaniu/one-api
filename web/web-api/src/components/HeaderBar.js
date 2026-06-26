import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';

import { API, getLogo, getSystemName, showSuccess } from '../helpers';
import '../index.css';
import './HeaderBar.css';

import fireworks from 'react-fireworks';

import { IconHelpCircle, IconKey, IconUser, IconSun, IconMoon } from '@douyinfe/semi-icons';
import { stringToColor } from '../helpers/render';

// HeaderBar Buttons
let headerButtons = [
  {
    text: '关于',
    itemKey: 'about',
    to: '/about',
    icon: <IconHelpCircle />
  }
];

if (localStorage.getItem('chat_link')) {
  headerButtons.splice(1, 0, {
    name: '聊天',
    to: '/chat',
    icon: 'comments'
  });
}

const HeaderBar = () => {
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const [dark, setDark] = useState(false);
  const systemName = getSystemName();
  const logo = getLogo();
  var themeMode = localStorage.getItem('theme-mode');
  const currentDate = new Date();
  // enable fireworks on new year(1.1 and 2.9-2.24)
  const isNewYear = (currentDate.getMonth() === 0 && currentDate.getDate() === 1) || (currentDate.getMonth() === 1 && currentDate.getDate() >= 9 && currentDate.getDate() <= 24);

  async function logout() {
    setShowSidebar(false);
    await API.get('/api/user/logout');
    showSuccess('注销成功!');
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const handleNewYearClick = () => {
    fireworks.init('root', {});
    fireworks.start();
    setTimeout(() => {
      fireworks.stop();
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    }, 3000);
  };

  useEffect(() => {
    if (themeMode === 'dark') {
      switchMode(true);
    }
    if (isNewYear) {
      console.log('Happy New Year!');
    }
  }, []);

  const switchMode = (model) => {
    const body = document.body;
    if (!model) {
      body.removeAttribute('theme-mode');
      localStorage.setItem('theme-mode', 'light');
    } else {
      body.setAttribute('theme-mode', 'dark');
      localStorage.setItem('theme-mode', 'dark');
    }
    setDark(model);
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="header-container">
      {/* 左侧区域 */}
      <div className="header-left">
        <h1 className="header-title">{systemName}</h1>
      </div>

      {/* 右侧区域 */}
      <div className="header-right">
        {/* 导航链接 */}
        <nav className="header-nav">
          <Link to="/about" className="header-nav-item">
            <IconHelpCircle className="header-nav-icon" />
            <span>关于</span>
          </Link>
        </nav>

        {/* 新年装饰 */}
        {isNewYear && (
          <div className="new-year-badge" onClick={handleNewYearClick}>
            🏮 新年快乐
          </div>
        )}

        {/* 主题切换 */}
        <button className="theme-toggle" onClick={() => switchMode(!dark)}>
          <span className="theme-icon">
            {dark ? <IconSun /> : <IconMoon />}
          </span>
        </button>

        {/* 用户菜单 */}
        {userState.user ? (
          <div className="header-dropdown">
            <div
              className="user-menu"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar">
                {userState.user.username[0].toUpperCase()}
              </div>
              <span className="user-name">{userState.user.username}</span>
            </div>

            {/* 下拉菜单 */}
            <div className={`header-dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
              <button
                className="header-dropdown-item danger"
                onClick={logout}
              >
                退出登录
              </button>
            </div>
          </div>
        ) : (
          <div className="header-nav">
            <Link to="/login" className="header-nav-item">
              <IconKey className="header-nav-icon" />
              <span>登录</span>
            </Link>
            <Link to="/register" className="header-nav-item">
              <IconUser className="header-nav-icon" />
              <span>注册</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBar;
