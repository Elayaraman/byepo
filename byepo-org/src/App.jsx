import { useState, useEffect } from 'react';
import { isValidFlagName, FLAG_NAME_PATTERN, FLAG_NAME_PATTERN_TITLE, getCookie, setCookie, deleteCookie } from '../../shared/validators.js';

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

  // Feature Flag State
  const [flags, setFlags] = useState([]);
  const [newFlagName, setNewFlagName] = useState('');
  const [flagsError, setFlagsError] = useState('');

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
    setFlags([]);
    setOrgName('');
    setOrgId(null);
    setStatus('select');
    window.history.pushState(null, '', '/');
  };

  useEffect(() => {
    if (!token) {
      setFlags([]);
      return;
    }

    fetch('http://localhost:3000/_api/flag', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setFlags(data.data);
        } else {
          setFlagsError(data.error || 'Failed to load feature flags');
        }
      })
      .catch((err) => {
        if (err.message !== 'Unauthorized') {
          setFlagsError('Error connecting to server to load feature flags');
        }
      });
  }, [token]);

  const handleCreateFlag = async (e) => {
    e.preventDefault();
    setFlagsError('');
    const flagKey = newFlagName.trim();
    if (!flagKey) return;

    if (!isValidFlagName(flagKey)) {
      setFlagsError('Feature flag name must contain only lowercase letters, numbers, underscores, or hyphens');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/_api/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: flagKey })
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setFlags([...flags, data.data]);
        setNewFlagName('');
      } else {
        setFlagsError(data.error || 'Failed to create feature flag');
      }
    } catch (err) {
      setFlagsError('Error connecting to server to create feature flag');
    }
  };

  const handleToggleFlag = async (flagId, currentEnabled) => {
    setFlagsError('');
    try {
      const res = await fetch(`http://localhost:3000/_api/flag/${flagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setFlags(flags.map((f) => f.id === flagId ? data.data : f));
      } else {
        setFlagsError(data.error || 'Failed to update feature flag');
      }
    } catch (err) {
      setFlagsError('Error connecting to server to update feature flag');
    }
  };

  const handleDeleteFlag = async (flagId) => {
    if (!window.confirm("Are you sure you want to delete this feature flag?")) return;
    setFlagsError('');
    try {
      const res = await fetch(`http://localhost:3000/_api/flag/${flagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setFlags(flags.filter((f) => f.id !== flagId));
      } else {
        setFlagsError(data.error || 'Failed to delete feature flag');
      }
    } catch (err) {
      setFlagsError('Error connecting to server to delete feature flag');
    }
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
            <div className="space-y-6">
              {flagsError && (
                <div className="p-2 bg-red-100 text-red-700 border border-red-300 text-sm">
                  {flagsError}
                </div>
              )}

              {/* Create Flag Form */}
              <form onSubmit={handleCreateFlag} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New flag key (e.g. new-ui)"
                  className="flex-1 p-2 border border-gray-300"
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  required
                  pattern={FLAG_NAME_PATTERN}
                  title={FLAG_NAME_PATTERN_TITLE}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 cursor-pointer rounded-sm hover:bg-green-700 whitespace-nowrap text-sm font-bold"
                >
                  Add Flag
                </button>
              </form>

              {/* Flags List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {flags.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feature flags found. Add one above!</p>
                ) : (
                  flags.map((flag) => (
                    <div key={flag.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-sm">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-mono text-sm truncate font-bold" title={flag.name}>
                          {flag.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(flag.id, flag.enabled)}
                          className={`px-3 py-1 text-xs font-bold rounded-sm cursor-pointer border ${
                            flag.enabled
                              ? 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                              : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                          }`}
                        >
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFlag(flag.id)}
                          className="btn px-3 py-1 rounded-sm border border-gray-300 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
