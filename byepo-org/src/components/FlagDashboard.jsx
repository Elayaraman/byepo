import { useState, useEffect } from 'react';
import { isValidFlagName, FLAG_NAME_PATTERN, FLAG_NAME_PATTERN_TITLE } from '../../../shared/validators.js';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import FormField from '../../../shared/components/FormField.jsx';
import FlagList from './FlagList.jsx';
import { useForm, apiRequest } from '../../../shared/fe_utils.js';

/**
 * Flag management section: create form + flag list.
 * Handles 401 responses by calling onLogout.
 *
 * @param {{ token: string, onLogout: () => void }} props
 */
export default function FlagDashboard({ token, onLogout }) {
  const [flags, setFlags] = useState([]);

  const validate = (values) => {
    const errors = {};
    const flagKey = values.newFlagName.trim();
    if (!flagKey) {
      errors.newFlagName = 'Flag name is required';
    } else if (!isValidFlagName(flagKey)) {
      errors.newFlagName = FLAG_NAME_PATTERN_TITLE;
    }
    return errors;
  };

  const { values, setValues, errors, setErrors, loading, handleChange, handleSubmit } = useForm(
    { newFlagName: '' },
    validate
  );

  const handleFetchFlags = async () => {
    try {
      const data = await apiRequest('/_api/flag', { token, onUnauthorized: onLogout });
      setFlags(data.data);
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  useEffect(() => {
    handleFetchFlags();
  }, [token]);

  const handleCreate = async (formValues) => {
    try {
      const data = await apiRequest('/_api/flag', {
        method: 'POST',
        token,
        onUnauthorized: onLogout,
        body: JSON.stringify({ name: formValues.newFlagName.trim() }),
      });
      setFlags([...flags, data.data]);
      setValues({ newFlagName: '' });
    } catch (err) {
      setErrors({ newFlagName: err.message });
    }
  };

  const handleToggle = async (flagId, currentEnabled) => {
    try {
      const data = await apiRequest(`/_api/flag/${flagId}`, {
        method: 'PUT',
        token,
        onUnauthorized: onLogout,
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      setFlags(flags.map((f) => (f.id === flagId ? data.data : f)));
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  const handleRename = async (flagId, newName) => {
    try {
      const data = await apiRequest(`/_api/flag/${flagId}`, {
        method: 'PUT',
        token,
        onUnauthorized: onLogout,
        body: JSON.stringify({ name: newName }),
      });
      setFlags(flags.map((f) => (f.id === flagId ? data.data : f)));
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  const handleDelete = async (flagId) => {
    if (!window.confirm('Are you sure you want to delete this feature flag?')) return;
    try {
      await apiRequest(`/_api/flag/${flagId}`, {
        method: 'DELETE',
        token,
        onUnauthorized: onLogout,
      });
      setFlags(flags.filter((f) => f.id !== flagId));
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <ErrorBanner message={errors.global} />

      <form onSubmit={(e) => handleSubmit(e, handleCreate)} className="flex gap-2 items-end">
        <div className="flex-1">
          <FormField
            label="New Flag Key"
            id="newFlagName"
            type="text"
            placeholder="e.g. new-checkout-flow"
            value={values.newFlagName}
            onChange={handleChange}
            error={errors.newFlagName}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 cursor-pointer font-bold rounded-sm disabled:opacity-50 h-10 flex items-center transition-colors text-sm"
        >
          {loading ? 'Adding...' : 'Add Flag'}
        </button>
      </form>

      <FlagList
        flags={flags}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onRename={handleRename}
      />
    </div>
  );
}
