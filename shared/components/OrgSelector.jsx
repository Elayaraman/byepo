import { useState } from 'react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="p-8 font-sans border border-gray-300 max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-4">{description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300"
          placeholder="Organization name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 cursor-pointer">
          Continue
        </button>
      </form>
    </div>
  );
}
