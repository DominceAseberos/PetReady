import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { assessmentRouter } from './routes/assessments.js';
import { simulationRouter } from './routes/simulations.js';
import { resultsRouter } from './routes/results.js';

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
app.use('/v1/auth', authRouter);
app.use('/v1/assessments', assessmentRouter);
app.use('/v1/simulations', simulationRouter);
app.use('/v1', resultsRouter);

// Error handling (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[api] PetReady API running on port ${PORT}`);
});

export default app;
