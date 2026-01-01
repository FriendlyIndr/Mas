import 'dotenv/config';
import db from './db.js';

import express from 'express';
const app = express();
const port = 3000;

// Test db connection
const startServer = async () => {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

