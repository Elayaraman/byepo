import { useState } from 'react';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import FormField from '../../../shared/components/FormField.jsx';

/**
 * Super admin login form.
 * @param {{ onLogin: (token: string) => void }} props
 */
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/_api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user.role !== 'super_admin') {
          setError('Access denied. Super admin only.');
        } else {
          onLogin(data.token);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="p-8 font-sans max-w-md w-full border border-gray-300">
        <h2 className="text-xl font-bold mb-4">Super Admin Login</h2>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
