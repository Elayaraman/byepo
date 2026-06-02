import { useState, useEffect } from 'react';
import { getCookie, setCookie, deleteCookie } from '../../shared/validators.js';
import OrgSelector from '../../shared/components/OrgSelector.jsx';
import InvalidOrg from '../../shared/components/InvalidOrg.jsx';
import LoadingSpinner from '../../shared/components/LoadingSpinner.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import FlagDashboard from './components/FlagDashboard.jsx';

export default function App() {
  const [orgName, setOrgName] = useState(window.location.pathname.split('/')[1] || '');
  const [orgId, setOrgId] = useState(null);
  const [status, setStatus] = useState(orgName ? 'loading' : 'waiting_for_org');
  const [token, setToken] = useState(getCookie('org_admin_token'));

  // Resolve org name → id on mount / org change
  useEffect(() => {
    if (!orgName) {
      setStatus('waiting_for_org');
      return;
    }
    setStatus('loading');
    fetch(`/_api/org/public/${orgName}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrgId(data.data.id);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => setStatus('invalid'));
  }, [orgName]);

  const handleOrgSubmit = (name) => {
    window.history.pushState(null, '', '/' + name);
    setOrgName(name);
  };

  const handleAuth = (newToken) => {
    setCookie('org_admin_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    deleteCookie('org_admin_token');
    setToken(null);
    setOrgName('');
    setOrgId(null);
    setStatus('waiting_for_org');
    window.history.pushState(null, '', '/');
  };

  const handleRetry = () => {
    window.history.pushState(null, '', '/');
    setOrgName('');
    setOrgId(null);
  };

  return (
    <div className="flex min-h-screen justify-center items-center">
      {status === 'waiting_for_org' && (
        <OrgSelector title="Org Admin Portal" onSubmit={handleOrgSubmit} />
      )}

      {status === 'loading' && <LoadingSpinner />}

      {status === 'invalid' && (
        <InvalidOrg orgName={orgName} onRetry={handleRetry} />
      )}

      {status === 'valid' && (
        <div className="p-8 font-sans max-w-[600px] w-full border border-gray-300">
          <header className="mb-6 flex justify-between items-center border-b pb-4">
            <h1 className="text-xl font-bold">{orgName} - Admin</h1>
            {token && (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 text-sm cursor-pointer rounded-sm"
              >
                Logout
              </button>
            )}
          </header>

          {token ? (
            <FlagDashboard token={token} onLogout={handleLogout} />
          ) : (
            <AuthPanel orgId={orgId} onAuth={handleAuth} />
          )}
        </div>
      )}
    </div>
  );
}
