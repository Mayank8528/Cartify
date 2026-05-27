import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import './config/env.js';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 5000;

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Connect to MongoDB before starting the server — retry with backoff until connected
const start = async () => {
  const maxAttempts = Infinity; // keep retrying in dev until fixed
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      await connectDB();
      console.log('MongoDB connection established');
      break;
    } catch (err) {
      const waitMs = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
      console.error(`DB connect attempt ${attempt} failed: ${err.message}. Retrying in ${waitMs}ms...`);
      // wait before retrying
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, waitMs));
    }
  }
};

start();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

// Health endpoint for deployment platforms
app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.status(state === 1 ? 200 : 503).json({ status: state === 1 ? 'ok' : 'down', readyState: state });
});

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
