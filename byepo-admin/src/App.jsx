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

  if (token) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="p-8 font-sans max-w-md w-full border border-gray-300">
          <h2 className="text-xl font-bold mb-4">Super Admin Dashboard</h2>
          <p className="mb-6">Welcome! You are successfully logged in.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white p-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

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

export default App;