import { useState, useEffect } from 'react';
import { isValidOrgName } from '../../../shared/validators.js';
import FormField from '../../../shared/components/FormField.jsx';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import OrgList from './OrgList.jsx';
import { useForm, apiRequest } from '../../../shared/fe_utils.js';

/**
 * Super admin dashboard: create org form, search, and org list.
 * @param {{ token: string, onLogout: () => void }} props
 */
export default function Dashboard({ token, onLogout }) {
  const [orgList, setOrgList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const validate = (values) => {
    const errors = {};
    const name = values.orgName.trim();
    if (!name) {
      errors.orgName = 'Organization name is required';
    } else if (!isValidOrgName(name)) {
      errors.orgName = 'Organization name must be a single word (no spaces)';
    }
    return errors;
  };

  const { values, setValues, errors, setErrors, loading, handleChange, handleSubmit } = useForm(
    { orgName: '' },
    validate
  );

  const handleFetchOrgs = async () => {
    try {
      const data = await apiRequest('/_api/org', { token, onUnauthorized: onLogout });
      setOrgList(data.data);
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  useEffect(() => {
    handleFetchOrgs();
  }, [token]);

  const handleCreateOrg = async (formValues) => {
    try {
      const data = await apiRequest('/_api/org', {
        method: 'POST',
        token,
        onUnauthorized: onLogout,
        body: JSON.stringify({ name: formValues.orgName.trim() }),
      });
      setOrgList([...orgList, data.data]);
      setValues({ orgName: '' });
    } catch (err) {
      setErrors({ orgName: err.message });
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      await apiRequest(`/_api/org/${orgId}`, {
        method: 'DELETE',
        token,
        onUnauthorized: onLogout,
      });
      setOrgList(orgList.filter((org) => org.id !== orgId));
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  const handleRotate = async (orgId) => {
    if (!window.confirm('Are you sure you want to rotate the invite code? The old code will no longer work.')) return;
    try {
      const data = await apiRequest(`/_api/org/${orgId}/rotate-code`, {
        method: 'POST',
        token,
        onUnauthorized: onLogout,
      });
      setOrgList(orgList.map((org) => (org.id === orgId ? data.data : org)));
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  const filteredOrgs = orgList.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen items-center flex-col justify-between w-full bg-gray-50">
      <header className="flex justify-between p-4 w-full items-center bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold">Super Admin Dashboard</h2>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 cursor-pointer font-bold rounded-sm text-sm transition-colors"
        >
          Logout
        </button>
      </header>

      <div className="p-8 font-sans max-w-[700px] w-full flex flex-1 flex-col border border-gray-200 bg-white shadow-sm mt-6 mb-6 rounded-sm">
        <ErrorBanner message={errors.global} />

        <form onSubmit={(e) => handleSubmit(e, handleCreateOrg)} className="mb-6 flex gap-2 items-end">
          <div className="flex-1">
            <FormField
              label="New Organization"
              id="orgName"
              type="text"
              placeholder="e.g. AcmeCorp"
              value={values.orgName}
              onChange={handleChange}
              error={errors.orgName}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 cursor-pointer font-bold rounded-sm disabled:opacity-50 h-10 flex items-center transition-colors"
          >
            {loading ? 'Creating...' : 'Create Org'}
          </button>
        </form>

        <div className="mb-6">
          <FormField
            label="Search Organizations"
            id="searchQuery"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-500 mb-2 uppercase tracking-wider">Organizations</h3>
          <OrgList orgs={filteredOrgs} onRotate={handleRotate} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
