/**
 * Single org row card.
 * @param {{ org: object, onRotate: (id) => void, onDelete: (id) => void }} props
 */
export default function OrgCard({ org, onRotate, onDelete }) {
  return (
    <div className="mb-2 flex w-[600px] justify-between items-center p-4 border border-gray-200">
      <div>
        <p className="text-sm"><strong>Name:</strong> {org.name}</p>
        <p className="text-sm"><strong>Invite Code:</strong> {org.inviteCode}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onRotate(org.id)}
          className="btn border-1 px-4 py-2 rounded-sm cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
        >
          Rotate Code
        </button>
        <button
          type="button"
          onClick={() => onDelete(org.id)}
          className="btn border-1 px-4 py-2 rounded-sm cursor-pointer bg-red-300 text-white hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
