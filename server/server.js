import express from 'express'
import db from './services/db.js'
import authRouter from './routes/auth.js'
import orgRouter from './routes/org.js'

const app = express()
const port = 3000
const PREFIX = '/_api/'

app.use(express.json())
app.use(`${PREFIX}auth`, authRouter)
app.use(`${PREFIX}org`, orgRouter)

await db.exec(`
  CREATE TABLE IF NOT EXISTS org (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    inviteCode TEXT NOT NULL
  )
`)

app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})