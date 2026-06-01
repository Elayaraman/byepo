/**
 * Shared validators for both frontend and backend systems.
 */

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
    return /^[a-z0-9_-]+$/.test(trimmed);
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
