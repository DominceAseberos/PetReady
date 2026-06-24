import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { db } from '../db/connection.js';
import { createSimulation, getActiveSimulation, completeTask, respondToEvent } from '../services/simulation.service.js';

export const simulationRouter = Router();

const CreateSimSchema = z.object({
  assessment_id: z.string().uuid(),
  pet_type: z.enum(['dog', 'cat', 'bird', 'rabbit']),
  pet_size: z.enum(['small', 'medium', 'large']).optional(),
  duration_days: z.number().int().min(3).max(7).default(3),
});

simulationRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const data = CreateSimSchema.parse(req.body);
    const sim = await createSimulation(req.userId!, {
      assessmentId: data.assessment_id,
      petType: data.pet_type,
      petSize: data.pet_size,
      durationDays: data.duration_days,
    });
    res.status(201).json(sim);
  } catch (err) {
    next(err);
  }
});

simulationRouter.get('/active', authenticate, async (req, res, next) => {
  try {
    const sim = await getActiveSimulation(req.userId!);
    if (!sim) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No active simulation' } });
    res.json(sim);
  } catch (err) {
    next(err);
  }
});

simulationRouter.get('/:id/tasks', authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT t.* FROM tasks t JOIN simulations s ON t.simulation_id = s.id
       WHERE t.simulation_id = $1 AND s.user_id = $2 ORDER BY t.scheduled_at`,
      [req.params.id, req.userId],
    );
    res.json({ tasks: rows });
  } catch (err) {
    next(err);
  }
});

simulationRouter.patch('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const task = await completeTask(req.params.id, req.userId!);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

simulationRouter.get('/:id/events', authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT e.* FROM events e JOIN simulations s ON e.simulation_id = s.id
       WHERE e.simulation_id = $1 AND s.user_id = $2 ORDER BY e.triggered_at`,
      [req.params.id, req.userId],
    );
    res.json({ events: rows });
  } catch (err) {
    next(err);
  }
});

simulationRouter.post('/events/:id/respond', authenticate, async (req, res, next) => {
  try {
    const { choice } = z.object({ choice: z.string() }).parse(req.body);
    const result = await respondToEvent(req.params.id, req.userId!, choice);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
