import 'dotenv/config';
import db from './db.js';
import express from 'express';
import authRouter from './routes/auth.routes.js';
import tasksRouter from './routes/tasks.routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

// For dev
app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend
  credentials: true
}));

app.use('/auth' , authRouter);
app.use('/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

// Test db connection
const startServer = async () => {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');

    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();