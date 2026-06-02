import { useState } from 'react';
import { getCookie, setCookie, deleteCookie } from '../../shared/fe_utils.js';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [token, setToken] = useState(getCookie('super_admin_token'));

  const handleLogin = (newToken) => {
    setCookie('super_admin_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    deleteCookie('super_admin_token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;