import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js'; // Імпорт роутера користувача
import errorHandler from './middleware/errorHandler.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import logger from './middleware/logger.js';
import { connectMongoDB } from './db/connectMongoDB.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(logger);

// Реєстрація загальних роутів без префіксів
app.use(authRouter);
app.use(notesRouter);
app.use(userRouter); // Підключення загального роуту користувача

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectMongoDB();
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
