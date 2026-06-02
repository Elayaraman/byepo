import FlagRow from './FlagRow.jsx';

/**
 * List of feature flags with empty state.
 * @param {{ flags: object[], onToggle: (id, enabled) => void, onDelete: (id) => void, onRename: (id, newName) => void }} props
 */
export default function FlagList({ flags, onToggle, onDelete, onRename }) {
  if (flags.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No feature flags found. Add one above!
      </p>
    );
  }
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {flags.map((flag) => (
        <FlagRow key={flag.id} flag={flag} onToggle={onToggle} onDelete={onDelete} onRename={onRename} />
      ))}
    </div>
  );
}
