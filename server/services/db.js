import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbFilename = process.env.NODE_ENV === 'test' ? ':memory:' : './database.db';

const db = await open({
  filename: dbFilename,
  driver: sqlite3.Database,
});

await db.get("PRAGMA foreign_keys = ON;");

export default db;