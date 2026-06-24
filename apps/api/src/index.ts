import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

// Parsing
app.use(express.json({ limit: '1mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// Routes
app.use('/health', healthRouter);

// Error handling (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[api] PetReady API running on port ${PORT}`);
});

export default app;
