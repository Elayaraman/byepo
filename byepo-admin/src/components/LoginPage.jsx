import ErrorBanner from '../../../shared/components/ErrorBanner.jsx';
import FormField from '../../../shared/components/FormField.jsx';
import { useForm, apiRequest } from '../../../shared/fe_utils.js';

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
  return errors;
};

/**
 * Super admin login form.
 * @param {{ onLogin: (token: string) => void }} props
 */
export default function LoginPage({ onLogin }) {
  const { values, errors, loading, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    validate
  );

  const handleFormSubmit = async (formValues) => {
    const data = await apiRequest('/_api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formValues),
    });
    if (data.user.role !== 'super_admin') {
      throw new Error('Access denied. Super admin only.');
    }
    onLogin(data.token);
  };

  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="p-8 font-sans max-w-md w-full border border-gray-300 rounded-sm shadow-sm bg-white">
        <h2 className="text-xl font-bold mb-4">Super Admin Login</h2>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 cursor-pointer font-bold rounded-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
