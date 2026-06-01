import { logger } from '../services/logger.js';

export default function errorHandler(err, req, res, next) {
  logger.error(`Error on request ${req.method} ${req.url}`, err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    error: message
  });
}
