import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { createAssessment, getLatestAssessment } from '../services/assessment.service.js';

export const assessmentRouter = Router();

const AssessmentSchema = z.object({
  responses: z.object({
    living_space: z.string(),
    has_yard: z.boolean(),
    work_schedule: z.string(),
    hours_away_daily: z.number().min(0).max(24),
    monthly_income_range: z.string(),
    monthly_pet_budget: z.number().min(0),
    family_members: z.number().min(1),
    existing_pets: z.array(z.string()),
    travel_frequency: z.string(),
    prior_pet_experience: z.string(),
    reason_for_adopting: z.string(),
    commitment_years: z.string(),
  }),
});

assessmentRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const data = AssessmentSchema.parse(req.body);
    const result = await createAssessment(req.userId!, data.responses);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

assessmentRouter.get('/latest', authenticate, async (req, res, next) => {
  try {
    const assessment = await getLatestAssessment(req.userId!);
    if (!assessment) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No assessment found — take the quiz first' } });
    res.json(assessment);
  } catch (err) {
    next(err);
  }
});
