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

function App() {
  const [token, setToken] = useState(getCookie('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [orgList, setOrgList] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/_api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        if (data.user.role !== 'super_admin') {
          setError('Access denied. Super admin only.');
        } else {
          setCookie('token', data.token);
          setToken(data.token);
        }
      } else {
        setError(data.error || 'Login failed');
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

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3000/_api/org', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrgList(data.data);
        }
      });

  }, [token])

  if (!token) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="p-8 font-sans max-w-md w-full border border-gray-300">
          <h2 className="text-xl font-bold mb-4">Super Admin Login</h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center flex-col justify-between">
      <header className='flex justify-between p-4 min-w-full items-center'>
        <h2 className="text-xl font-bold inline">Super Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white p-4 cursor-pointer"
        >
          Logout
        </button>
      </header>
      <div className="p-8 font-sans max-w-md w-full flex flex-1 min-w-full border justify-center border-gray-300">
        <div className='flex flex-col w-[400px]'>
          <div>
            {orgList.map((org) => (
              <div key={org.id} className="mb-2 flex w-[420px] justify-between items-center">
                <div>
                  <p className="text-sm"><strong>Name:</strong> {org.name}</p>
                  <p className="text-sm"><strong>Invite Code:</strong> {org.inviteCode}</p>
                </div>
                <button className='btn border-1 px-4 py-2 rounded-sm cursor-pointer bg-red-300 text-white hover:bg-red-500 ' type="button">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;