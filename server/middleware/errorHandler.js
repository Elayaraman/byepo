import { logger } from '../services/logger.js';

export default function errorHandler(err, req, res, next) {
  // Check for DB unique constraint errors first
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    let errorMsg = 'Database unique constraint violation';
    if (err.message.includes('org.name')) {
      errorMsg = 'Organization name already exists';
    } else if (err.message.includes('feature_flags.org_id, feature_flags.name')) {
      errorMsg = 'Feature flag name already exists for this organization';
    } else if (err.message.includes('users.org_id, users.email') || err.message.includes('users.email')) {
      errorMsg = 'Email already registered';
    }
    logger.warn(`Unique constraint violation: ${errorMsg}`);
    return res.status(400).json({ success: false, error: errorMsg });
  }

  // Handle custom status errors
  if (err.status && err.status < 500) {
    logger.warn(`Client error ${err.status}: ${err.message}`);
    return res.status(err.status).json({
      success: false,
      error: err.message
    });
  }

  // Fallback to internal server error
  logger.error(`Error on request ${req.method} ${req.url}`, err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({
    success: false,
    error: message
  });
}
