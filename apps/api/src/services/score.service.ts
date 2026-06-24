import { db } from '../db/connection.js';
import { SCORE_WEIGHTS } from '@petready/shared';
import crypto from 'crypto';

export async function calculateScore(simulationId: string, userId: string) {
  // Fetch all data needed
  const { rows: [sim] } = await db.query('SELECT * FROM simulations WHERE id = $1', [simulationId]);
  const { rows: tasks } = await db.query('SELECT * FROM tasks WHERE simulation_id = $1', [simulationId]);
  const { rows: events } = await db.query('SELECT * FROM events WHERE simulation_id = $1', [simulationId]);
  const { rows: [assessment] } = await db.query('SELECT * FROM assessments WHERE id = $1', [sim.assessment_id]);

  // Time consistency score (25%)
  const completedTasks = tasks.filter((t: { completed_at: string | null }) => t.completed_at);
  const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;
  const avgResponseMs = completedTasks.length > 0
    ? completedTasks.reduce((sum: number, t: { response_time_ms: number }) => sum + (t.response_time_ms || 0), 0) / completedTasks.length
    : Infinity;
  const speedFactor = Math.max(0, 1 - (avgResponseMs / (1000 * 60 * 60))); // Decay over 1 hour
  const timeScore = Math.round((completionRate * 0.7 + speedFactor * 0.3) * 100);

  // Financial score (20%)
  const budget = sim.budget_stated || 300;
  const totalExpenses = Number(sim.total_expenses) || 0;
  const budgetRatio = totalExpenses > 0 ? Math.min(1, budget / (totalExpenses * 10)) : 0.7;
  const eventFinancialResponses = events.filter((e: { responded_at: string | null; score_impact: number }) => e.responded_at);
  const financialDecisionScore = eventFinancialResponses.length > 0
    ? eventFinancialResponses.reduce((s: number, e: { score_impact: number }) => s + (e.score_impact || 0), 0) / (eventFinancialResponses.length * 10)
    : 0.5;
  const financialScore = Math.round((budgetRatio * 0.5 + financialDecisionScore * 0.5) * 100);

  // Living situation score (15%) — from assessment
  const livingScore = assessment?.living_space_score || 50;

  // Flexibility score (15%) — event response times
  const respondedEvents = events.filter((e: { responded_at: string | null }) => e.responded_at);
  const avgEventResponse = respondedEvents.length > 0
    ? respondedEvents.reduce((s: number, e: { response_time_ms: number }) => s + (e.response_time_ms || 0), 0) / respondedEvents.length
    : 1000 * 60 * 60;
  const flexibilityScore = Math.round(Math.max(0, Math.min(100, 100 - (avgEventResponse / (1000 * 60 * 30)) * 30)));

  // Experience score (10%) — from assessment
  const experienceScore = assessment?.experience_score || 30;

  // Emotional score (10%) — commitment indicators from assessment
  const commitmentYears = assessment?.responses?.commitment_years;
  const emotionalBase = commitmentYears === '10+' ? 90 : commitmentYears === '5-10' ? 70 : 50;
  const emotionalScore = Math.min(100, emotionalBase + (completionRate > 0.8 ? 10 : 0));

  // Household score (5%) — from assessment
  const existingPets = assessment?.responses?.existing_pets || [];
  const householdScore = existingPets.length === 0 ? 80 : 60;

  // Overall weighted score
  const overallScore = Math.round(
    timeScore * SCORE_WEIGHTS.time +
    financialScore * SCORE_WEIGHTS.financial +
    livingScore * SCORE_WEIGHTS.living +
    flexibilityScore * SCORE_WEIGHTS.flexibility +
    experienceScore * SCORE_WEIGHTS.experience +
    emotionalScore * SCORE_WEIGHTS.emotional +
    householdScore * SCORE_WEIGHTS.household
  );

  // Determine label
  const scoreLabel = overallScore >= 85 ? 'highly_ready'
    : overallScore >= 70 ? 'mostly_ready'
    : overallScore >= 50 ? 'needs_preparation'
    : 'not_ready';

  // Generate recommendations
  const gaps: string[] = [];
  const strengths: string[] = [];
  const recommendations: { category: string; priority: string; message: string; evidence: string }[] = [];

  if (timeScore >= 75) strengths.push('Excellent task consistency');
  else { gaps.push('Inconsistent daily care routine'); recommendations.push({ category: 'time', priority: 'high', message: 'Set daily alarms for pet care tasks', evidence: `Completed ${Math.round(completionRate * 100)}% of tasks` }); }

  if (financialScore >= 75) strengths.push('Good financial preparedness');
  else { gaps.push('Budget may be tight for pet expenses'); recommendations.push({ category: 'financial', priority: 'high', message: 'Build an emergency pet fund of at least $500', evidence: `Budget-to-expense ratio indicates strain` }); }

  if (flexibilityScore >= 70) strengths.push('Quick response to emergencies');
  else { gaps.push('Slow response to unexpected situations'); recommendations.push({ category: 'flexibility', priority: 'medium', message: 'Build a network of backup caregivers', evidence: 'Event response times were above average' }); }

  if (experienceScore < 50) { gaps.push('Limited pet care experience'); recommendations.push({ category: 'experience', priority: 'medium', message: 'Take a basic pet care or training course', evidence: 'First-time or limited experience owner' }); }

  const shareToken = crypto.randomBytes(16).toString('hex');

  // Save results
  const { rows: [result] } = await db.query(
    `INSERT INTO results (simulation_id, user_id, overall_score, time_score, financial_score,
     living_score, flexibility_score, experience_score, emotional_score, household_score,
     score_label, recommendations, strengths, gaps, share_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [simulationId, userId, overallScore, timeScore, financialScore, livingScore,
     flexibilityScore, experienceScore, emotionalScore, householdScore,
     scoreLabel, JSON.stringify(recommendations), JSON.stringify(strengths),
     JSON.stringify(gaps), shareToken],
  );

  // Generate preparation items
  for (const rec of recommendations) {
    await db.query(
      `INSERT INTO preparation_items (result_id, user_id, category, action_item, timeframe)
       VALUES ($1, $2, $3, $4, $5)`,
      [result.id, userId, rec.category, rec.message, rec.priority === 'high' ? 'Before adopting' : '2 weeks'],
    );
  }

  // Mark simulation as completed
  await db.query(`UPDATE simulations SET status = 'completed', end_date = NOW() WHERE id = $1`, [simulationId]);

  return result;
}
