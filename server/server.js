import express from 'express'
import sqlite3 from 'sqlite3'
const app = express();
const db = new (sqlite3.verbose().Database)("./database.db");
const port = 3000;

db.serialize(() => {
  db.run('CREATE TABLE lorem (info TEXT)');
  const stmt = db.prepare('INSERT INTO lorem VALUES (?)');

  for (let i = 0; i < 10; i++) {
    stmt.run(`Ipsum ${i}`);
  }

  stmt.finalize();

  db.each('SELECT rowid AS id, info FROM lorem', (err, row) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log(`${row.id}: ${row.info}`);
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});