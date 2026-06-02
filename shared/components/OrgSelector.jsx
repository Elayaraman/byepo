import { useState } from 'react';
import { isValidOrgName } from '../validators.js';
import FormField from './FormField.jsx';

/**
 * Shared org name entry screen.
 * Owns its own input state; calls onSubmit(orgName) when submitted.
 * The parent is responsible for any URL updates after submission.
 *
 * @param {{ title?: string, description?: string, onSubmit: (name: string) => void }} props
 */
export default function OrgSelector({
  title = 'Welcome',
  description = 'Enter your organization name to continue.',
  onSubmit,
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Organization name is required');
      return;
    }
    if (!isValidOrgName(trimmed)) {
      setError('Organization name must be a single word without spaces');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <div className="p-8 font-sans border border-gray-300 max-w-sm w-full rounded-sm shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-4 text-sm text-gray-600">{description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Organization Name"
          id="orgName"
          type="text"
          placeholder="e.g. google"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          error={error}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 cursor-pointer font-bold rounded-sm transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
