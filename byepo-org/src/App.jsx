import { useState, useEffect } from 'react';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export default function App() {
  const [orgName, setOrgName] = useState(window.location.pathname.split('/')[1] || '');
  const [inputOrgName, setInputOrgName] = useState('');
  const [orgId, setOrgId] = useState(null);
  const [status, setStatus] = useState('loading');
  const [token, setToken] = useState(getCookie('token'));
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orgName) {
      setStatus('waiting_for_org');
      return;
    }

    setStatus('loading');
    fetch(`http://localhost:3000/_api/org/public/${orgName}`)
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

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    if (inputOrgName.trim()) {
      const newOrgName = inputOrgName.trim();
      window.history.pushState(null, '', '/' + newOrgName);
      setOrgName(newOrgName);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      const body = authMode === 'login'
        ? { email, password, orgId }
        : { email, password, orgId, inviteCode };

      const res = await fetch(`http://localhost:3000/_api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        if (data.user.role !== 'org_admin') {
          setError('Access denied. Org admin only.');
        } else {
          setCookie('token', data.token);
          setToken(data.token);
          // Clear inputs
          setEmail('');
          setPassword('');
          setInviteCode('');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    deleteCookie('token');
    setToken(null);
  };

  return (
    <div className="flex min-h-screen justify-center items-center">
      {status === 'waiting_for_org' && (
        <div className="p-8 font-sans border border-gray-300 max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Org Admin Portal</h2>
          <p className="mb-4">Enter your organization name to continue.</p>
          <form onSubmit={handleOrgSubmit} className="space-y-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-300"
              placeholder="Organization name"
              value={inputOrgName}
              onChange={(e) => setInputOrgName(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 cursor-pointer">
              Continue
            </button>
          </form>
        </div>
      )}

      {status === 'loading' && <div className="p-8 font-sans">Loading...</div>}

      {status === 'invalid' && (
        <div className="p-8 font-sans border border-gray-300 max-w-sm w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Organization</h2>
          <p className="mb-4">The organization "{orgName}" does not exist.</p>
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              setOrgName('');
              setOrgId(null);
            }}
            className="text-blue-600 underline cursor-pointer"
          >
            Try another organization
          </button>
        </div>
      )}

      {status === 'valid' && (
        <div className="p-8 font-sans max-w-md w-full border border-gray-300">
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
            <div className="space-y-4">
              <div className="p-4 bg-green-100 text-green-800 border border-green-300 font-bold">
                Successfully Authenticated!
              </div>
              <p>Welcome to the dashboard for <strong>{orgName}</strong>.</p>
              <p className="text-sm text-gray-600">You are logged in as an Organization Admin.</p>
            </div>
          ) : (
            <div>
              <div className="flex mb-4 border-b">
                <button
                  type="button"
                  className={`flex-1 pb-2 font-bold cursor-pointer ${authMode === 'login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
                    }`}
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`flex-1 pb-2 font-bold cursor-pointer ${authMode === 'signup' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
                    }`}
                  onClick={() => {
                    setAuthMode('signup');
                    setError('');
                  }}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block font-bold mb-1">Invite Code</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300"
                      placeholder="Enter invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
