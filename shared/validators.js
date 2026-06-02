/**
 * Shared validators for both frontend and backend systems.
 */

/**
 * Regex pattern string for feature flag names.
 * Only lowercase letters, numbers, hyphens, and underscores are allowed.
 * Used for both JS validation and HTML input pattern attributes.
 */
export const FLAG_NAME_PATTERN = '^[a-z0-9_-]+$';

export const FLAG_NAME_PATTERN_TITLE =
    'Feature flag name must contain only lowercase letters, numbers, underscores, or hyphens, and be at least 3 characters long';

/**
 * Checks if an organization name is valid (a single word with no spaces/whitespace).
 * @param {string} name 
 * @returns {boolean}
 */
export function isValidOrgName(name) {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length === 0) return false;
    return /^\S+$/.test(trimmed);
}

/**
 * Checks if a feature flag name is valid (only lowercase letters, numbers, hyphens, or underscores).
 * @param {string} name 
 * @returns {boolean}
 */
export function isValidFlagName(name) {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 3) return false;
    return new RegExp(FLAG_NAME_PATTERN).test(trimmed);
}

/**
 * Checks if a password is valid (at least 6 characters).
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 6;
}

/**
 * Checks if a value matches a certain value or is present in a set of certain values.
 * @param {*} value 
 * @param {*} certainValue 
 * @returns {boolean}
 */
export function isCertainValue(value, certainValue) {
    if (Array.isArray(certainValue)) {
        return certainValue.includes(value);
    }
    return value === certainValue;
}

// ─── Browser-only cookie utilities ────────────────────────────────────────────
// These are safe to import in browser environments (Vite/React).
// Do NOT call these on the server side.

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
