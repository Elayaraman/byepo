export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}

/**
 * Validates that all specified fields are present on the target object.
 * Throws a BadRequestError if any are missing or empty.
 */
export function validate(obj, fields, message) {
    if (!obj) {
        throw new BadRequestError(message || 'Request body/query is missing');
    }
    const missing = fields.filter(
        (field) => obj[field] === undefined || obj[field] === null || obj[field] === ''
    );
    if (missing.length > 0) {
        throw new BadRequestError(message || `Missing required fields: ${missing.join(', ')}`);
    }
}
