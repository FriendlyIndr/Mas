import 'dotenv/config';
import db from './db.js';
import express from 'express';
import authRouter from './routes/auth.routes.js';
import cors from 'cors';

const app = express();
const port = 3000;

// Test db connection
const startServer = async () => {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');

    // for dev only - Remove in production
    await db.sync({ alter: false });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

app.use(express.json());

// For dev
app.use(cors({
  origin: 'http://localhost:5173', // frontend
  credentials: true
}));

app.use('/auth' , authRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

