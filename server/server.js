import express from 'express'
import cors from 'cors'
import db from './services/db.js'
import authRouter from './routes/auth.js'
import orgRouter from './routes/org.js'
import flagRouter from './routes/flag.js'

const app = express()
const port = 3000
const PREFIX = '/_api/'

app.use(cors())
app.use(express.json())
app.use(`${PREFIX}auth`, authRouter)
app.use(`${PREFIX}org`, orgRouter)
app.use(`${PREFIX}flag`, flagRouter)

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
    FOREIGN KEY (org_id) REFERENCES org(id),
    UNIQUE(org_id, email)
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (org_id) REFERENCES org(id),
    UNIQUE(org_id, name)
);
`)

app.get('/', (req, res) => {
  res.send('Server is running')
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

export default app;