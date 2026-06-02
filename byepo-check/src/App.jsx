import { useState, useEffect } from 'react';
import OrgSelector from '../../shared/components/OrgSelector.jsx';
import InvalidOrg from '../../shared/components/InvalidOrg.jsx';
import LoadingSpinner from '../../shared/components/LoadingSpinner.jsx';
import FlagChecker from './components/FlagChecker.jsx';
import { apiRequest } from '../../shared/fe_utils.js';

export default function App() {
  const getInitialOrg = () => {
    const params = new URLSearchParams(window.location.search);
    const queryOrg = params.get('org');
    if (queryOrg) return queryOrg;
    return window.location.pathname.split('/')[1] || '';
  };

  const [orgName, setOrgName] = useState(getInitialOrg());
  const [status, setStatus] = useState(orgName ? 'loading' : 'waiting_for_org');

  useEffect(() => {
    if (!orgName) {
      setStatus('waiting_for_org');
      return;
    }
    setStatus('loading');
    apiRequest(`/_api/org/public/${orgName}`)
      .then((data) => {
        if (data.success) {
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => setStatus('invalid'));
  }, [orgName]);

  const handleOrgSubmit = (name) => {
    window.history.pushState(null, '', '/' + name);
    setOrgName(name);
  };

  const handleRetry = () => {
    window.history.pushState(null, '', '/');
    setOrgName('');
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-50 p-4">
      {status === 'waiting_for_org' && (
        <OrgSelector title="Feature Flag Checker" onSubmit={handleOrgSubmit} />
      )}
      {status === 'loading' && <LoadingSpinner />}
      {status === 'invalid' && <InvalidOrg orgName={orgName} onRetry={handleRetry} />}
      {status === 'valid' && (
        <FlagChecker orgName={orgName} />
      )}
    </div>
  );
}