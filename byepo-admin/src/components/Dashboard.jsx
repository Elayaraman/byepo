import { useState, useEffect } from 'react';
import { isValidOrgName } from '../../../shared/validators.js';
import OrgList from './OrgList.jsx';

/**
 * Super admin dashboard: create org form, search, and org list.
 * @param {{ token: string, onLogout: () => void }} props
 */
export default function Dashboard({ token, onLogout }) {
  const [orgList, setOrgList] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetch('/_api/org', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrgList(data.data);
      });
  }, [token]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    const name = newOrgName.trim();
    if (!name) return;
    if (!isValidOrgName(name)) {
      alert('Organization name must be a single word (no spaces)');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch('/_api/org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setOrgList([...orgList, data.data]);
        setNewOrgName('');
      } else {
        alert(data.error || 'Failed to create organization');
      }
    } catch {
      alert('Error connecting to server');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      const res = await fetch(`/_api/org/${orgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrgList(orgList.filter((org) => org.id !== orgId));
      } else {
        alert('Failed to delete organization');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const handleRotate = async (orgId) => {
    if (!window.confirm('Are you sure you want to rotate the invite code? The old code will no longer work.')) return;
    try {
      const res = await fetch(`/_api/org/${orgId}/rotate-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrgList(orgList.map((org) => (org.id === orgId ? data.data : org)));
      } else {
        alert('Failed to rotate invite code');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const filteredOrgs = orgList.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen items-center flex-col justify-between">
      <header className="flex justify-between p-4 min-w-full items-center">
        <h2 className="text-xl font-bold inline">Super Admin Dashboard</h2>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 cursor-pointer rounded-sm"
        >
          Logout
        </button>
      </header>

      <div className="p-8 font-sans max-w-[600px] w-full flex flex-1 min-w-full border justify-center border-gray-300">
        <div className="flex flex-col w-[600px]">
          <form onSubmit={handleCreateOrg} className="mb-8 flex gap-2 w-[600px]">
            <input
              type="text"
              placeholder="New Organization Name"
              className="flex-1 p-2 border border-gray-300"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={createLoading}
              className="bg-green-600 text-white px-4 py-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {createLoading ? 'Creating...' : 'Create Org'}
            </button>
          </form>

          <div className="mb-4 flex w-[600px]">
            <input
              type="text"
              placeholder="search organisation"
              className="flex-1 p-2 border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <OrgList orgs={filteredOrgs} onRotate={handleRotate} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
