import { useState, useEffect } from 'react';
import OrgSelector from '../../shared/components/OrgSelector.jsx';
import InvalidOrg from '../../shared/components/InvalidOrg.jsx';
import LoadingSpinner from '../../shared/components/LoadingSpinner.jsx';
import FlagChecker from './components/FlagChecker.jsx';

export default function App() {
  const [orgName, setOrgName] = useState(window.location.pathname.split('/')[1] || '');
  const [status, setStatus] = useState(orgName ? 'loading' : 'waiting_for_org');

  useEffect(() => {
    if (!orgName) {
      setStatus('waiting_for_org');
      return;
    }
    setStatus('loading');
    fetch(`/_api/org/public/${orgName}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatus('valid');
        else setStatus('invalid');
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
    <div className="flex min-h-screen justify-center items-center">
      {status === 'waiting_for_org' && <OrgSelector onSubmit={handleOrgSubmit} />}
      {status === 'loading' && <LoadingSpinner />}
      {status === 'invalid' && <InvalidOrg orgName={orgName} onRetry={handleRetry} />}
      {status === 'valid' && (
        <div className="p-8 font-sans">
          <header className="mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold">Byepo Check</h1>
          </header>
          <FlagChecker orgName={orgName} />
        </div>
      )}
    </div>
  );
}