import { db } from '../db/connection.js';

interface SubScores { livingScore: number; financialScore: number; scheduleScore: number; experienceScore: number; }

/** Space scoring weights by living type. */
const SPACE_SCORES: Record<string, number> = {
  apartment_small: 30, apartment_large: 50, house_small: 70, house_large: 90, farm: 100,
};

/** Experience scoring weights by prior experience level. */
const EXPERIENCE_SCORES: Record<string, number> = {
  none: 20, childhood_only: 40, roommate_had_pet: 50, owned_briefly: 60, current_owner: 80, professional: 100,
};

/** Calculate sub-scores from quiz responses for initial assessment. */
export function calculateSubScores(responses: Record<string, unknown>): SubScores {
  const r = responses as Record<string, string | number | boolean | string[]>;

  const livingScore = Math.min(100, (SPACE_SCORES[r.living_space as string] || 50) + (r.has_yard ? 20 : 0));
  const financialScore = Math.min(100, Math.round(((r.monthly_pet_budget as number) / 500) * 100));
  const scheduleScore = Math.max(0, Math.min(100, Math.round(100 - ((r.hours_away_daily as number) - 4) * 12)));
  const experienceScore = EXPERIENCE_SCORES[r.prior_pet_experience as string] || 30;

  return { livingScore, financialScore, scheduleScore, experienceScore };
}

/** Recommend a pet type and size based on assessment scores. */
export function recommendPet(scores: SubScores, responses: Record<string, unknown>): { type: string; size: string | null } {
  const avg = (scores.livingScore + scores.financialScore + scores.scheduleScore) / 3;
  const hours = responses.hours_away_daily as number;

  if (hours > 10 || avg < 40) return { type: 'cat', size: null };
  if (scores.livingScore < 50) return { type: 'dog', size: 'small' };
  if (scores.livingScore >= 70) return { type: 'dog', size: 'large' };
  return { type: 'dog', size: 'medium' };
}

/** Save assessment to database and return the result. */
export async function createAssessment(userId: string, responses: Record<string, unknown>) {
  const scores = calculateSubScores(responses);
  const rec = recommendPet(scores, responses);

  const { rows } = await db.query(
    `INSERT INTO assessments (user_id, responses, recommended_pet_type, recommended_pet_size,
      living_space_score, financial_score, schedule_score, experience_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, recommended_pet_type, recommended_pet_size, created_at`,
    [userId, JSON.stringify(responses), rec.type, rec.size,
      scores.livingScore, scores.financialScore, scores.scheduleScore, scores.experienceScore],
  );

  return { ...rows[0], sub_scores: scores };
}

/** Get the latest assessment for a user. */
export async function getLatestAssessment(userId: string) {
  const { rows } = await db.query(
    'SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId],
  );
  return rows[0] || null;
}
