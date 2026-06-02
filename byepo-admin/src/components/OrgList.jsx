import OrgCard from './OrgCard.jsx';

/**
 * List of org cards with empty state.
 * @param {{ orgs: object[], onRotate: (id) => void, onDelete: (id) => void }} props
 */
export default function OrgList({ orgs, onRotate, onDelete }) {
  if (orgs.length === 0) {
    return <p className="text-gray-500 text-center py-4">No organizations found.</p>;
  }
  return (
    <div>
      {orgs.map((org) => (
        <OrgCard key={org.id} org={org} onRotate={onRotate} onDelete={onDelete} />
      ))}
    </div>
  );
}
