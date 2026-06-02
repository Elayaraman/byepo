import { useState } from 'react';
import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import FormField from '../../../shared/components/FormField.jsx';
import { useForm, apiRequest } from '../../../shared/fe_utils.js';

/**
 * Tabbed login/signup form for org admins.
 * @param {{ orgId: number, onAuth: (token: string) => void }} props
 */
export default function AuthPanel({ orgId, onAuth }) {
  const [authMode, setAuthMode] = useState('login');

  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (authMode === 'signup' && !values.inviteCode.trim()) {
      errors.inviteCode = 'Invite code is required';
    }
    return errors;
  };

  const { values, errors, setErrors, loading, handleChange, handleSubmit } = useForm(
    { email: '', password: '', inviteCode: '' },
    validate
  );

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
  };

  const handleFormSubmit = async (formValues) => {
    const endpoint = authMode === 'login' ? 'login' : 'signup';
    const body =
      authMode === 'login'
        ? { email: formValues.email, password: formValues.password, orgId }
        : { email: formValues.email, password: formValues.password, orgId, inviteCode: formValues.inviteCode };

    const data = await apiRequest(`/_api/auth/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (data.user.role !== 'org_admin') {
      throw new Error('Access denied. Org admin only.');
    }
    onAuth(data.token);
  };

  return (
    <div className="w-full">
      {/* Mode tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {['login', 'signup'].map((mode) => (
          <button
            key={mode}
            type="button"
            className={`flex-1 pb-2 font-bold cursor-pointer text-sm transition-all ${
              authMode === mode
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => switchMode(mode)}
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        ))}
      </div>

      <ErrorBanner message={errors.global} />

      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <FormField
          label="Email"
          id="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
        {authMode === 'signup' && (
          <FormField
            label="Invite Code"
            id="inviteCode"
            type="text"
            placeholder="Enter invite code"
            value={values.inviteCode}
            onChange={handleChange}
            error={errors.inviteCode}
            required
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 cursor-pointer font-bold rounded-sm disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
