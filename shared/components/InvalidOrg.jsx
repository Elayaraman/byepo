/**
 * Shared "org not found" screen.
 *
 * @param {{ orgName: string, onRetry: () => void }} props
 */
export default function InvalidOrg({ orgName, onRetry }) {
  return (
    <div className="p-8 font-sans border border-gray-300 max-w-sm w-full">
      <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Organization</h2>
      <p className="mb-4">The organization &quot;{orgName}&quot; does not exist.</p>
      <button onClick={onRetry} className="text-blue-600 underline cursor-pointer">
        Try another organization
      </button>
    </div>
  );
}
