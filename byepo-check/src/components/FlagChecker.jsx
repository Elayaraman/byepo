import { useState } from 'react';
import FormField from '../../../shared/components/FormField.jsx';

/**
 * Flag status checker form + result display.
 * @param {{ orgName: string }} props
 */
export default function FlagChecker({ orgName }) {
  const [flagKey, setFlagKey] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setResult(null);
    try {
      const res = await fetch(`/_api/flag/check?org_name=${orgName}&name=${flagKey}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.enabled ? 'Enabled' : 'Disabled');
      } else {
        setResult('Error checking flag');
      }
    } catch {
      setResult('Error connecting to server');
    }
  };

  return (
    <main className="max-w-md">
      <h2 className="text-xl font-bold mb-2">Check Feature Status</h2>
      <p className="mb-6">
        Verify the status of a feature toggle for <strong>{orgName}</strong>.
      </p>

      <form onSubmit={handleCheck} className="space-y-4">
        <FormField
            label="Feature Key"
            id="flagKey"
            type="text"
            placeholder="e.g. new-checkout-flow"
            value={flagKey}
            onChange={(e) => setFlagKey(e.target.value)}
            required
          />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 cursor-pointer">
          Check Status
        </button>

        {result && (
          <div className="mt-4 p-4 border border-gray-300 font-bold">
            Result: {result}
          </div>
        )}
      </form>
    </main>
  );
}
