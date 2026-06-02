import { useState } from 'react';

const getApiBase = () => {
  try {
    if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {}
  
  if (typeof window !== 'undefined') {
    const hn = window.location.hostname;
    if (hn === 'localhost' || hn === '127.0.0.1' || hn.startsWith('192.168.')) {
      return '';
    }
  }
  return 'https://byepo.onrender.com';
};

const API_BASE = getApiBase();

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
  const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(targetUrl, {
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

/**
 * Reads a cookie value by name from document.cookie.
 * @param {string} name
 * @returns {string|null}
 */
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * Sets a cookie with the given name, value, and expiry in days.
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
export function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

/**
 * Deletes a cookie by name by setting its expiry to the past.
 * @param {string} name
 */
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
