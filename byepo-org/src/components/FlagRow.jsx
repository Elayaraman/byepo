import { useState } from 'react';
import { isValidFlagName, FLAG_NAME_PATTERN_TITLE } from '../../../shared/validators.js';

/**
 * Single feature flag row with toggle, rename, and delete.
 * @param {{ flag: object, onToggle: (id, enabled) => void, onDelete: (id) => void, onRename: (id, newName) => void }} props
 */
export default function FlagRow({ flag, onToggle, onDelete, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(flag.name);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    if (trimmed.length < 3) {
      setError('Feature flag name must be at least 3 characters');
      return;
    }
    if (!isValidFlagName(trimmed)) {
      setError(FLAG_NAME_PATTERN_TITLE);
      return;
    }
    setError('');
    onRename(flag.id, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(flag.name);
    setError('');
  };

  return (
    <div className="flex flex-col p-3 border border-gray-200 rounded-sm bg-white gap-2 shadow-sm">
      <div className="flex justify-between items-center w-full">
        <div className="flex-1 min-w-0 pr-4">
          {isEditing ? (
            <div className="flex flex-col gap-1 w-full">
              <input
                type="text"
                className={`font-mono text-sm p-1 border rounded-sm w-full ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError('');
                }}
                required
              />
              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
            </div>
          ) : (
            <p className="font-mono text-sm truncate font-bold" title={flag.name}>
              {flag.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-sm cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-sm cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 rounded-sm cursor-pointer"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => onToggle(flag.id, flag.enabled)}
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
                onClick={() => onDelete(flag.id)}
                className="px-3 py-1 rounded-sm border border-gray-300 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
