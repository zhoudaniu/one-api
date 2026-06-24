import { initVChartSemiTheme } from '@visactor/vchart-semi-theme';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import HeaderBar from './components/HeaderBar';
import Footer from './components/Footer';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import './Layout.css';
import {UserProvider} from './context/User';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {StatusProvider} from './context/Status';
import SiderBar from "./components/SiderBar";

// initialization
initVChartSemiTheme({
    isWatchingThemeSwitch: true,
});

// 忽略 ResizeObserver 错误（常见但无害）
const errorHandler = (event) => {
  if (event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      event.message?.includes('ResizeObserver')) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
};
window.addEventListener('error', errorHandler);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <StatusProvider>
            <UserProvider>
                <BrowserRouter>
                    <div className="app-layout">
                        {/* 侧边栏 */}
                        <aside className="app-sidebar">
                            <SiderBar/>
                        </aside>

                        {/* 主内容区域 */}
                        <div className="app-main">
                            {/* 顶部栏 */}
                            <header className="app-header">
                                <HeaderBar/>
                            </header>

                            {/* 内容区域 */}
                            <main className="app-content">
                                <App/>
                            </main>

                            {/* 底部栏 */}
                            <footer className="app-footer">
                                <Footer/>
                            </footer>
                        </div>
                    </div>
                    <ToastContainer/>
                </BrowserRouter>
            </UserProvider>
        </StatusProvider>
    </React.StrictMode>
);
