import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import compression from 'compression';
import ProductRouter from './Routes/productRoutes.js';
import CartRouter from './Routes/cartRoutes.js';


dotenv.config();

const app = express();


app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const time = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${time}ms`);
  });
  next();
});


app.use(compression());

app.use(cors({
    origin : "*"
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(hpp());


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/products', ProductRouter);
app.use('/api/cart', CartRouter);


app.get('/', (req, res) => {
  res.json({
    message: 'vibeCommerce API Server',
    version: '1.0.0',
    status: 'running',
  });
});


app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

export default app;
