import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

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

function calculateSubScores(responses: Record<string, unknown>) {
  const r = responses as Record<string, string | number | boolean | string[]>;

  // Living space score (0-100)
  const spaceMap: Record<string, number> = {
    apartment_small: 30, apartment_large: 50, house_small: 70, house_large: 90, farm: 100,
  };
  const livingScore = (spaceMap[r.living_space as string] || 50) + (r.has_yard ? 20 : 0);

  // Financial score
  const budget = r.monthly_pet_budget as number;
  const financialScore = Math.min(100, Math.round((budget / 500) * 100));

  // Schedule score
  const hours = r.hours_away_daily as number;
  const scheduleScore = Math.max(0, Math.round(100 - (hours - 4) * 12));

  // Experience score
  const expMap: Record<string, number> = {
    none: 20, childhood_only: 40, roommate_had_pet: 50, owned_briefly: 60, current_owner: 80, professional: 100,
  };
  const experienceScore = expMap[r.prior_pet_experience as string] || 30;

  return {
    livingScore: Math.min(100, livingScore),
    financialScore: Math.min(100, financialScore),
    scheduleScore: Math.max(0, Math.min(100, scheduleScore)),
    experienceScore,
  };
}

function recommendPet(scores: ReturnType<typeof calculateSubScores>, responses: Record<string, unknown>) {
  const avg = (scores.livingScore + scores.financialScore + scores.scheduleScore) / 3;
  const hours = responses.hours_away_daily as number;

  if (hours > 10 || avg < 40) return { type: 'cat', size: null };
  if (scores.livingScore < 50) return { type: 'dog', size: 'small' };
  if (scores.livingScore >= 70) return { type: 'dog', size: 'large' };
  return { type: 'dog', size: 'medium' };
}

assessmentRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const data = AssessmentSchema.parse(req.body);
    const scores = calculateSubScores(data.responses);
    const rec = recommendPet(scores, data.responses);

    const { rows } = await db.query(
      `INSERT INTO assessments (user_id, responses, recommended_pet_type, recommended_pet_size,
        living_space_score, financial_score, schedule_score, experience_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, recommended_pet_type, recommended_pet_size, created_at`,
      [req.userId, JSON.stringify(data.responses), rec.type, rec.size,
        scores.livingScore, scores.financialScore, scores.scheduleScore, scores.experienceScore],
    );

    res.status(201).json({ ...rows[0], sub_scores: scores });
  } catch (err) {
    next(err);
  }
});

assessmentRouter.get('/latest', authenticate, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.userId],
    );
    if (rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No assessment found' } });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
