import express from 'express'
import sqlite3 from 'sqlite3'
import authRouter from './routes/auth.js'
const app = express();
const db = new (sqlite3.verbose().Database)("./database.db");
const port = 3000;

const PREFIX = '/_api/'

app.use((PREFIX+"auth"),authRouter)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});