/**
 * Single feature flag row with toggle and delete.
 * @param {{ flag: object, onToggle: (id, enabled) => void, onDelete: (id) => void }} props
 */
export default function FlagRow({ flag, onToggle, onDelete }) {
  return (
    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-sm">
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-mono text-sm truncate font-bold" title={flag.name}>
          {flag.name}
        </p>
      </div>
      <div className="flex items-center gap-3">
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
          className="btn px-3 py-1 rounded-sm border border-gray-300 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
