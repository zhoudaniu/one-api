import { showError } from './utils';
import axios from 'axios';

// 使用相对路径，通过 React 开发服务器的代理转发到后端
// package.json 中已配置 "proxy": "http://localhost:3000"
export const API = axios.create({
  baseURL: '',
});

// 请求拦截器 - 添加用户认证信息
API.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取用户信息
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // 添加用户 ID 到请求头
      config.headers['New-Api-User'] = userData.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理 401 未授权错误 - session 过期
    if (error.response && error.response.status === 401) {
      // 清除本地用户数据
      localStorage.removeItem('user');
      // 重定向到登录页
      window.location.href = '/login';
      return Promise.resolve({ data: { success: false, message: '未登录' } });
    }
    // 其他错误也返回一个标准格式，避免 undefined.data 错误
    showError(error);
    return Promise.resolve({ data: { success: false, message: error.message || '请求失败' } });
  }
);
