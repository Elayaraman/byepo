import { useState, useEffect } from 'react';
import { isValidOrgName, getCookie, setCookie, deleteCookie } from '../../shared/validators.js';

function App() {
  const [token, setToken] = useState(getCookie('super_admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [orgList, setOrgList] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/_api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        if (data.user.role !== 'super_admin') {
          setError('Access denied. Super admin only.');
        } else {
          setCookie('super_admin_token', data.token);
          setToken(data.token);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    deleteCookie('super_admin_token');
    setToken(null);
  };

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3000/_api/org', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrgList(data.data);
        }
      });

  }, [token])

  async function handleCreateOrg(e) {
    e.preventDefault();
    const orgName = newOrgName.trim();
    if (!orgName) return;

    if (!isValidOrgName(orgName)) {
      alert('Organization name must be a single word (no spaces)');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch('http://localhost:3000/_api/org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: orgName })
      });
      const data = await res.json();
      if (data.success) {
        setOrgList([...orgList, data.data]);
        setNewOrgName('');
      } else {
        alert(data.error || 'Failed to create organization');
      }
    } catch (err) {
      alert('Error connecting to server to create organization');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDelete(orgId) {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        const res = await fetch(`http://localhost:3000/_api/org/${orgId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrgList(orgList.filter(org => org.id !== orgId));
        } else {
          alert('Failed to delete organization');
        }
      } catch (err) {
        alert('Error connecting to server to delete organization');
      }
    }
  }

  async function handleRotate(orgId) {
    if (window.confirm("Are you sure you want to rotate the invite code? The old code will no longer work.")) {
      try {
        const res = await fetch(`http://localhost:3000/_api/org/${orgId}/rotate-code`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrgList(orgList.map(org => org.id === orgId ? data.data : org));
        } else {
          alert('Failed to rotate invite code');
        }
      } catch (err) {
        alert('Error connecting to server to rotate code');
      }
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="p-8 font-sans max-w-md w-full border border-gray-300">
          <h2 className="text-xl font-bold mb-4">Super Admin Login</h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-bold mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredOrgs = orgList.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen items-center flex-col justify-between">
      <header className='flex justify-between p-4 min-w-full items-center'>
        <h2 className="text-xl font-bold inline">Super Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 cursor-pointer rounded-sm"
        >
          Logout
        </button>
      </header>
      <div className="p-8 font-sans max-w-[600px] w-full flex flex-1 min-w-full border justify-center border-gray-300">
        <div className='flex flex-col w-[600px]'>
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

          <div>
            {filteredOrgs.map((org) => (
                <div key={org.id} className="mb-2 flex w-[600px] justify-between items-center p-4 border border-gray-200">
                  <div>
                    <p className="text-sm"><strong>Name:</strong> {org.name}</p>
                    <p className="text-sm"><strong>Invite Code:</strong> {org.inviteCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRotate(org.id)} className='btn border-1 px-4 py-2 rounded-sm cursor-pointer bg-blue-500 text-white hover:bg-blue-600' type="button">
                      Rotate Code
                    </button>
                    <button onClick={() => handleDelete(org.id)} className='btn border-1 px-4 py-2 rounded-sm cursor-pointer bg-red-300 text-white hover:bg-red-500' type="button">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;