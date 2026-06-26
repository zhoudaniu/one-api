import React from 'react';

const Chat = () => {
  const chatLink = localStorage.getItem('chat_link');

  if (!chatLink) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: '#64748B'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
        <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>聊天功能未配置</h3>
        <p style={{ margin: 0 }}>请在设置中配置聊天链接（chat_link）</p>
      </div>
    );
  }

  return (
    <iframe
      src={chatLink}
      style={{ width: '100%', height: '85vh', border: 'none' }}
    />
  );
};


export default Chat;
