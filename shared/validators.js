/**
 * Shared validators for both frontend and backend systems.
 */

/**
 * Regex pattern string for feature flag names.
 * Only lowercase letters, numbers, hyphens, and underscores are allowed.
 * Used for both JS validation and HTML input pattern attributes.
 */
export const FLAG_NAME_PATTERN = '^[a-z0-9_-]+$';

/** Title text to show on invalid flag name (for input title attribute). */
export const FLAG_NAME_PATTERN_TITLE =
    'Feature flag name must contain only lowercase letters, numbers, underscores, or hyphens';

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
    if (trimmed.length === 0) return false;
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

// ─── Browser-only cookie utilities relocated to fe_utils.js ──────────────────
