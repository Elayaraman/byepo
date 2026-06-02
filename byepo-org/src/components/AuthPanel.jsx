import { useState } from 'react';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import FormField from '../../../shared/components/FormField.jsx';

/**
 * Tabbed login/signup form for org admins.
 * @param {{ orgId: number, onAuth: (token: string) => void }} props
 */
export default function AuthPanel({ orgId, onAuth }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      const body =
        authMode === 'login'
          ? { email, password, orgId }
          : { email, password, orgId, inviteCode };

      const res = await fetch(`/_api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        if (data.user.role !== 'org_admin') {
          setError('Access denied. Org admin only.');
        } else {
          onAuth(data.token);
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex mb-4 border-b">
        {['login', 'signup'].map((mode) => (
          <button
            key={mode}
            type="button"
            className={`flex-1 pb-2 font-bold cursor-pointer ${
              authMode === mode
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => switchMode(mode)}
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        ))}
      </div>

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
        {authMode === 'signup' && (
          <FormField
            label="Invite Code"
            id="inviteCode"
            type="text"
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
          />
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
  );
}
