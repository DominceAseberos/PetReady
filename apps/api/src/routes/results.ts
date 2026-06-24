import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { db } from '../db/connection.js';
import { calculateScore } from '../services/score.service.js';

export const resultsRouter = Router();

// Complete simulation and calculate score
resultsRouter.post('/simulations/:id/complete', authenticate, async (req, res, next) => {
  try {
    const result = await calculateScore(req.params.id, req.userId!);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Get results for a simulation
resultsRouter.get('/simulations/:id/results', authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM results WHERE simulation_id = $1 AND user_id = $2',
      [req.params.id, req.userId],
    );
    if (rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Public share link (no auth)
resultsRouter.get('/share/:token', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT overall_score, time_score, financial_score, living_score, flexibility_score,
       experience_score, emotional_score, household_score, score_label, strengths, gaps
       FROM results WHERE share_token = $1`,
      [req.params.token],
    );
    if (rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get preparation checklist
resultsRouter.get('/preparation/:resultId', authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM preparation_items WHERE result_id = $1 AND user_id = $2 ORDER BY created_at',
      [req.params.resultId, req.userId],
    );
    const completed = rows.filter((r: { completed: boolean }) => r.completed).length;
    res.json({ items: rows, progress: { total: rows.length, completed, percentage: rows.length > 0 ? Math.round((completed / rows.length) * 100) : 0 } });
  } catch (err) {
    next(err);
  }
});

// Mark preparation item as done
resultsRouter.patch('/preparation/items/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `UPDATE preparation_items SET completed = TRUE, completed_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.userId],
    );
    if (rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
