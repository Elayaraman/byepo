import express from 'express'
import cors from 'cors'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import db from './services/db.js'
import authRouter from './routes/auth.js'
import orgRouter from './routes/org.js'
import flagRouter from './routes/flag.js'
import errorHandler from './middleware/errorHandler.js'
import { logger } from './services/logger.js'

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('./swagger.json', import.meta.url), 'utf8')
)

const app = express()
const port = 3000
const PREFIX = '/_api/'

app.use(cors())
app.use(express.json())

app.use('/_api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Incoming request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use(`${PREFIX}auth`, authRouter)
app.use(`${PREFIX}org`, orgRouter)
app.use(`${PREFIX}flag`, flagRouter)

// Error Handler Middleware
app.use(errorHandler)

await db.exec(`
  CREATE TABLE IF NOT EXISTS org (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    inviteCode TEXT NOT NULL
  );
  
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    FOREIGN KEY (org_id) REFERENCES org(id) ON DELETE CASCADE,
    UNIQUE(org_id, email)
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (org_id) REFERENCES org(id) ON DELETE CASCADE,
    UNIQUE(org_id, name)
  );
`)
logger.info("Database initialized successfully");

app.get('/', (req, res) => {
  res.send('Server is running')
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`)
  })
}

export default app;