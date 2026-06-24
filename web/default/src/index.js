import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import App from './App';
import Header from './components/Header';
import Footer from './components/Footer';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import { UserProvider } from './context/User';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StatusProvider } from './context/Status';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StatusProvider>
      <UserProvider>
        <BrowserRouter>
          <Header />
          <div className='modern-main'>
            <Container className={'main-content'} style={{ padding:0, width:'100%', maxWidth:'100%', margin:0 }}>
              <App />
            </Container>
          </div>
          <ToastContainer />
          <Footer />
        </BrowserRouter>
      </UserProvider>
    </StatusProvider>
  </React.StrictMode>
);
