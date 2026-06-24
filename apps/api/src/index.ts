import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { generalLimiter, authLimiter } from './middleware/rate-limit.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { assessmentRouter } from './routes/assessments.js';
import { simulationRouter } from './routes/simulations.js';
import { resultsRouter } from './routes/results.js';
import { db } from './db/connection.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Parsing
app.use(express.json({ limit: '1mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// Routes
app.use('/health', healthRouter);
app.use('/v1/auth', authLimiter, authRouter);
app.use('/v1/assessments', generalLimiter, assessmentRouter);
app.use('/v1/simulations', generalLimiter, simulationRouter);
app.use('/v1', generalLimiter, resultsRouter);

// Error handling (must be last)
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`[api] PetReady API running on port ${config.port} (${config.nodeEnv})`);
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[api] ${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await db.pool.end();
    console.log('[api] Server closed.');
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 10000); // Force exit after 10s
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
