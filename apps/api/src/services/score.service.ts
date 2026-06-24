import { db } from '../db/connection.js';
import { SCORE_WEIGHTS } from '@petready/shared';
import crypto from 'crypto';
import { NotFoundError } from '../middleware/error-handler.js';

// --- Types ---
interface TaskRow { completed_at: string | null; response_time_ms: number | null; }
interface EventRow { responded_at: string | null; response_time_ms: number | null; score_impact: number | null; }
interface Scores { time: number; financial: number; living: number; flexibility: number; experience: number; emotional: number; household: number; }
interface Recommendation { category: string; priority: string; message: string; evidence: string; }

// --- Individual Score Functions (each < 15 lines, single responsibility) ---

/** Time score: 70% completion rate + 30% response speed. Decays over 1 hour. */
function calculateTimeScore(tasks: TaskRow[]): number {
  const completed = tasks.filter((t) => t.completed_at);
  const completionRate = tasks.length > 0 ? completed.length / tasks.length : 0;
  const avgMs = completed.length > 0
    ? completed.reduce((sum, t) => sum + (t.response_time_ms || 0), 0) / completed.length
    : Infinity;
  const speedFactor = Math.max(0, 1 - avgMs / (1000 * 60 * 60));
  return Math.round((completionRate * 0.7 + speedFactor * 0.3) * 100);
}

/** Financial score: 50% budget ratio + 50% event decision quality. */
function calculateFinancialScore(budgetStated: number, totalExpenses: number, events: EventRow[]): number {
  const budgetRatio = totalExpenses > 0 ? Math.min(1, budgetStated / (totalExpenses * 10)) : 0.7;
  const responded = events.filter((e) => e.responded_at);
  const decisionScore = responded.length > 0
    ? responded.reduce((s, e) => s + (e.score_impact || 0), 0) / (responded.length * 10)
    : 0.5;
  return Math.round((budgetRatio * 0.5 + decisionScore * 0.5) * 100);
}

/** Flexibility score: based on how fast user responds to unexpected events. */
function calculateFlexibilityScore(events: EventRow[]): number {
  const responded = events.filter((e) => e.responded_at);
  const avgMs = responded.length > 0
    ? responded.reduce((s, e) => s + (e.response_time_ms || 0), 0) / responded.length
    : 1000 * 60 * 60; // Default: 1 hour (poor)
  return Math.round(Math.max(0, Math.min(100, 100 - (avgMs / (1000 * 60 * 30)) * 30)));
}

/** Emotional score: based on commitment level + task consistency bonus. */
function calculateEmotionalScore(commitmentYears: string | undefined, completionRate: number): number {
  const base = commitmentYears === '10+' ? 90 : commitmentYears === '5-10' ? 70 : 50;
  return Math.min(100, base + (completionRate > 0.8 ? 10 : 0));
}

/** Household score: simpler if no existing pets to manage. */
function calculateHouseholdScore(existingPets: string[]): number {
  return existingPets.length === 0 ? 80 : 60;
}

/** Weighted overall score from all sub-scores. */
function calculateOverallScore(scores: Scores): number {
  return Math.round(
    scores.time * SCORE_WEIGHTS.time +
    scores.financial * SCORE_WEIGHTS.financial +
    scores.living * SCORE_WEIGHTS.living +
    scores.flexibility * SCORE_WEIGHTS.flexibility +
    scores.experience * SCORE_WEIGHTS.experience +
    scores.emotional * SCORE_WEIGHTS.emotional +
    scores.household * SCORE_WEIGHTS.household,
  );
}

/** Map overall score to a human-readable label. */
function getScoreLabel(score: number): string {
  if (score >= 85) return 'highly_ready';
  if (score >= 70) return 'mostly_ready';
  if (score >= 50) return 'needs_preparation';
  return 'not_ready';
}

/** Generate recommendations based on weak areas. */
function generateRecommendations(scores: Scores, completionRate: number): { strengths: string[]; gaps: string[]; recommendations: Recommendation[] } {
  const strengths: string[] = [];
  const gaps: string[] = [];
  const recommendations: Recommendation[] = [];

  if (scores.time >= 75) strengths.push('Excellent task consistency');
  else { gaps.push('Inconsistent daily care routine'); recommendations.push({ category: 'time', priority: 'high', message: 'Set daily alarms for pet care tasks', evidence: `Completed ${Math.round(completionRate * 100)}% of tasks` }); }

  if (scores.financial >= 75) strengths.push('Good financial preparedness');
  else { gaps.push('Budget may be tight for pet expenses'); recommendations.push({ category: 'financial', priority: 'high', message: 'Build an emergency pet fund of at least $500', evidence: 'Budget-to-expense ratio indicates strain' }); }

  if (scores.flexibility >= 70) strengths.push('Quick response to emergencies');
  else { gaps.push('Slow response to unexpected situations'); recommendations.push({ category: 'flexibility', priority: 'medium', message: 'Build a network of backup caregivers', evidence: 'Event response times were above average' }); }

  if (scores.experience < 50) { gaps.push('Limited pet care experience'); recommendations.push({ category: 'experience', priority: 'medium', message: 'Take a basic pet care or training course', evidence: 'First-time or limited experience owner' }); }

  return { strengths, gaps, recommendations };
}

// --- Main Orchestrator ---

/** Calculate all scores and persist results for a completed simulation. */
export async function calculateScore(simulationId: string, userId: string) {
  // 1. Fetch data
  const { rows: [sim] } = await db.query('SELECT * FROM simulations WHERE id = $1 AND user_id = $2', [simulationId, userId]);
  if (!sim) throw new NotFoundError('Simulation');

  const { rows: tasks } = await db.query('SELECT * FROM tasks WHERE simulation_id = $1', [simulationId]);
  const { rows: events } = await db.query('SELECT * FROM events WHERE simulation_id = $1', [simulationId]);
  const { rows: [assessment] } = await db.query('SELECT * FROM assessments WHERE id = $1', [sim.assessment_id]);

  // 2. Calculate individual scores
  const completionRate = tasks.length > 0 ? tasks.filter((t: TaskRow) => t.completed_at).length / tasks.length : 0;
  const scores: Scores = {
    time: calculateTimeScore(tasks),
    financial: calculateFinancialScore(sim.budget_stated || 300, Number(sim.total_expenses) || 0, events),
    living: assessment?.living_space_score || 50,
    flexibility: calculateFlexibilityScore(events),
    experience: assessment?.experience_score || 30,
    emotional: calculateEmotionalScore(assessment?.responses?.commitment_years, completionRate),
    household: calculateHouseholdScore(assessment?.responses?.existing_pets || []),
  };

  // 3. Calculate overall + label
  const overallScore = calculateOverallScore(scores);
  const scoreLabel = getScoreLabel(overallScore);

  // 4. Generate recommendations
  const { strengths, gaps, recommendations } = generateRecommendations(scores, completionRate);

  // 5. Persist results
  const shareToken = crypto.randomBytes(16).toString('hex');
  const { rows: [result] } = await db.query(
    `INSERT INTO results (simulation_id, user_id, overall_score, time_score, financial_score,
     living_score, flexibility_score, experience_score, emotional_score, household_score,
     score_label, recommendations, strengths, gaps, share_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [simulationId, userId, overallScore, scores.time, scores.financial, scores.living,
     scores.flexibility, scores.experience, scores.emotional, scores.household,
     scoreLabel, JSON.stringify(recommendations), JSON.stringify(strengths),
     JSON.stringify(gaps), shareToken],
  );

  // 6. Generate preparation items
  for (const rec of recommendations) {
    await db.query(
      `INSERT INTO preparation_items (result_id, user_id, category, action_item, timeframe)
       VALUES ($1, $2, $3, $4, $5)`,
      [result.id, userId, rec.category, rec.message, rec.priority === 'high' ? 'Before adopting' : '2 weeks'],
    );
  }

  // 7. Mark simulation complete
  await db.query(`UPDATE simulations SET status = 'completed', end_date = NOW() WHERE id = $1`, [simulationId]);

  return result;
}
