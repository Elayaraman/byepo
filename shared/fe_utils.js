import { useState } from 'react';

/**
 * Common API request helper.
 * Handles Authorization headers, parsing response as JSON, and redirects on 401.
 * Throws clean errors.
 */
export async function apiRequest(url, options = {}) {
  const token = options.token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (res.status === 401 && options.onUnauthorized) {
    options.onUnauthorized();
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

/**
 * Common hook for form handling, field-level validation, and form submission.
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleCustomChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e, onSubmit) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const validationErrors = validate ? validate(values) : {};
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    loading,
    setLoading,
    handleChange,
    handleCustomChange,
    handleSubmit,
  };
}
