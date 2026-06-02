import { useState, useEffect } from 'react';
import { isValidFlagName, FLAG_NAME_PATTERN, FLAG_NAME_PATTERN_TITLE } from '../../../shared/validators.js';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import FlagList from './FlagList.jsx';

/**
 * Flag management section: create form + flag list.
 * Handles 401 responses by calling onLogout.
 *
 * @param {{ token: string, onLogout: () => void }} props
 */
export default function FlagDashboard({ token, onLogout }) {
  const [flags, setFlags] = useState([]);
  const [newFlagName, setNewFlagName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/_api/flag', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setFlags(data.data);
        else setError(data.error || 'Failed to load feature flags');
      })
      .catch((err) => {
        if (err.message !== 'Unauthorized') {
          setError('Error connecting to server to load feature flags');
        }
      });
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const flagKey = newFlagName.trim();
    if (!flagKey) return;
    if (!isValidFlagName(flagKey)) {
      setError(FLAG_NAME_PATTERN_TITLE);
      return;
    }
    try {
      const res = await fetch('/_api/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: flagKey }),
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setFlags([...flags, data.data]);
        setNewFlagName('');
      } else {
        setError(data.error || 'Failed to create feature flag');
      }
    } catch {
      setError('Error connecting to server to create feature flag');
    }
  };

  const handleToggle = async (flagId, currentEnabled) => {
    setError('');
    try {
      const res = await fetch(`/_api/flag/${flagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setFlags(flags.map((f) => (f.id === flagId ? data.data : f)));
      } else {
        setError(data.error || 'Failed to update feature flag');
      }
    } catch {
      setError('Error connecting to server to update feature flag');
    }
  };

  const handleDelete = async (flagId) => {
    if (!window.confirm('Are you sure you want to delete this feature flag?')) return;
    setError('');
    try {
      const res = await fetch(`/_api/flag/${flagId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setFlags(flags.filter((f) => f.id !== flagId));
      } else {
        setError(data.error || 'Failed to delete feature flag');
      }
    } catch {
      setError('Error connecting to server to delete feature flag');
    }
  };

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <form onSubmit={handleCreate} className="flex gap-2">
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

      <FlagList flags={flags} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}
