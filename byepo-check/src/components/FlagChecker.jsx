import { useState } from 'react';
import FormField from '../../../shared/components/FormField.jsx';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import { useForm, apiRequest } from '../../../shared/fe_utils.js';
import { isValidOrgName, isValidFlagName, FLAG_NAME_PATTERN_TITLE } from '../../../shared/validators.js';

/**
 * Flag status checker form + result display.
 * Reads org and name from URL query parameters (e.g. ?org=acme&name=new-ui) if present.
 */
export default function FlagChecker() {
  const [result, setResult] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // Read query params on load
  const params = new URLSearchParams(window.location.search);
  const initialOrg = params.get('org') || '';
  const initialFlag = params.get('name') || '';

  const validate = (values) => {
    const errors = {};
    const org = values.orgName.trim();
    const flag = values.flagKey.trim();

    if (!org) {
      errors.orgName = 'Organization name is required';
    } else if (!isValidOrgName(org)) {
      errors.orgName = 'Organization name must be a single word without spaces';
    }

    if (!flag) {
      errors.flagKey = 'Feature key is required';
    } else if (!isValidFlagName(flag)) {
      errors.flagKey = FLAG_NAME_PATTERN_TITLE;
    }
    return errors;
  };

  const { values, errors, setErrors, loading, handleChange, handleSubmit } = useForm(
    { orgName: initialOrg, flagKey: initialFlag },
    validate
  );

  const handleCheck = async (formValues) => {
    try {
      const data = await apiRequest(`/_api/flag/check?org_name=${formValues.orgName.trim()}&name=${formValues.flagKey.trim()}`);
      setResult(data.enabled ? 'Enabled' : 'Disabled');
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  return (
    <main className="max-w-md w-full border border-gray-300 p-8 rounded-sm shadow-sm bg-white font-sans">
      <h2 className="text-xl font-bold mb-2">Check Feature Status</h2>
      <p className="mb-6 text-sm text-gray-600">
        Verify the status of a feature toggle for your organization.
      </p>

      <ErrorBanner message={errors.global} />

      <form onSubmit={(e) => handleSubmit(e, handleCheck)} className="space-y-4">
        <FormField
          label="Organization Name"
          id="orgName"
          type="text"
          placeholder="e.g. acme"
          value={values.orgName}
          onChange={handleChange}
          error={errors.orgName}
          required
        />

        <FormField
          label="Feature Key"
          id="flagKey"
          type="text"
          placeholder="e.g. new-checkout-flow"
          value={values.flagKey}
          onChange={handleChange}
          error={errors.flagKey}
          required
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 mt-0.5 rounded-sm border-gray-300 cursor-pointer"
            required
          />
          <label htmlFor="agreeTerms" className="text-xs text-gray-600 cursor-pointer select-none">
            I agree to the terms and confirm I am authorized to query this organization's flags.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 cursor-pointer font-bold rounded-sm disabled:opacity-50 transition-colors"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>

        {result !== null && (
          <div className="mt-4 p-4 border border-gray-300 font-bold bg-gray-50 flex items-center gap-3 rounded-sm shadow-sm">
            <span className={result === 'Enabled' ? 'text-green-700' : 'text-red-700'}>
              {result === 'Enabled' ? 'Feature is enabled' : 'Feature is disabled'}
            </span>
          </div>
        )}
      </form>
    </main>
  );
}
