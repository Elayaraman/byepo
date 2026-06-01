import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, '../server.log');

export function log(level, message, error = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;
  if (error) {
    logMessage += `${error.stack || error.message || error}\n`;
  }
  
  // Append to server.log
  fs.appendFileSync(logFilePath, logMessage, 'utf8');
  
  // Also print to console
  if (level === 'error') {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
}

export const logger = {
  info: (msg) => log('info', msg),
  warn: (msg) => log('warn', msg),
  error: (msg, err) => log('error', msg, err)
};
