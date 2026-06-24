import pg from 'pg';
import { db } from '../db/connection.js';
import { ConflictError, NotFoundError } from '../middleware/error-handler.js';

interface CreateSimInput {
  assessmentId: string;
  petType: string;
  petSize?: string;
  durationDays: number;
}

const TASK_TEMPLATES: Record<string, { type: string; title: string; description: string; time: string }[]> = {
  dog: [
    { type: 'feeding', title: 'Morning feeding', description: 'Prepare and serve breakfast for your dog', time: '07:00' },
    { type: 'walking', title: 'Morning walk', description: 'Take your dog for a 20-minute walk', time: '07:30' },
    { type: 'training', title: 'Training session', description: 'Practice basic commands for 10 minutes', time: '12:00' },
    { type: 'feeding', title: 'Evening feeding', description: 'Prepare and serve dinner for your dog', time: '18:00' },
    { type: 'play', title: 'Playtime', description: 'Play fetch or tug-of-war for 15 minutes', time: '19:00' },
  ],
  cat: [
    { type: 'feeding', title: 'Morning feeding', description: 'Fill food and water bowls', time: '07:30' },
    { type: 'grooming', title: 'Litter box cleaning', description: 'Scoop and clean the litter box', time: '08:00' },
    { type: 'play', title: 'Interactive play', description: 'Use a feather toy for 10 minutes', time: '12:00' },
    { type: 'feeding', title: 'Evening feeding', description: 'Refresh food and water for the evening', time: '18:30' },
  ],
};

function generateTaskSchedule(petType: string, durationDays: number, startDate: Date, _timezone: string) {
  const templates = TASK_TEMPLATES[petType] || TASK_TEMPLATES.dog;
  const tasks: { type: string; title: string; description: string; dayNumber: number; scheduledAt: Date }[] = [];

  for (let day = 1; day <= durationDays; day++) {
    const dayTasks = day % 2 === 0 ? templates : templates.slice(0, -1); // Vary tasks per day
    for (const tpl of dayTasks) {
      const [hours, minutes] = tpl.time.split(':').map(Number);
      const scheduledAt = new Date(startDate);
      scheduledAt.setDate(scheduledAt.getDate() + day - 1);
      scheduledAt.setHours(hours, minutes, 0, 0);

      tasks.push({
        type: tpl.type,
        title: tpl.title,
        description: tpl.description,
        dayNumber: day,
        scheduledAt,
      });
    }
  }
  return tasks;
}

/** Create a new simulation for a user with scheduled tasks and random events. */
export async function createSimulation(userId: string, input: CreateSimInput) {
  // Check no active simulation
  const { rows: active } = await db.query(
    `SELECT id FROM simulations WHERE user_id = $1 AND status = 'active'`,
    [userId],
  );
  if (active.length > 0) {
    throw new ConflictError('SIMULATION_ALREADY_ACTIVE', 'You already have a simulation running — finish it first');
  }

  // Get assessment for budget info
  const { rows: assessments } = await db.query('SELECT * FROM assessments WHERE id = $1', [input.assessmentId]);
  if (assessments.length === 0) throw new NotFoundError('Assessment');
  const budget = assessments[0].responses?.monthly_pet_budget || 300;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + input.durationDays);

  // Create simulation + tasks + events in a single transaction
  const simulation = await db.transaction(async (client) => {
    const { rows: sims } = await client.query(
      `INSERT INTO simulations (user_id, assessment_id, pet_type, pet_size, duration_days, status, budget_stated, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8)
       RETURNING *`,
      [userId, input.assessmentId, input.petType, input.petSize || null, input.durationDays, budget, startDate, endDate],
    );
    const sim = sims[0];

    // Generate and insert tasks
    const tasks = generateTaskSchedule(input.petType, input.durationDays, startDate, 'UTC');
    for (const task of tasks) {
      await client.query(
        `INSERT INTO tasks (simulation_id, type, title, description, day_number, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sim.id, task.type, task.title, task.description, task.dayNumber, task.scheduledAt],
      );
    }

    // Generate random events (1-2 per simulation)
    await generateEventsInTx(client, sim.id, input.petType, input.durationDays, startDate);

    return sim;
  });

  return simulation;
}

async function generateEventsInTx(client: pg.PoolClient, simulationId: string, petType: string, days: number, startDate: Date) {
  const eventPool = [
    {
      type: 'emergency_vet', severity: 'high',
      scenario: `Your ${petType} suddenly starts vomiting and appears lethargic. They may have eaten something toxic.`,
      options: JSON.stringify([
        { id: 'a', text: 'Rush to emergency vet immediately', score: 10, cost: 400, explanation: 'Correct. Early intervention prevents complications.' },
        { id: 'b', text: 'Monitor for a few hours first', score: 4, cost: 0, explanation: 'Risky. Toxin ingestion can escalate quickly.' },
        { id: 'c', text: 'Search online for home remedies', score: 2, cost: 50, explanation: 'Dangerous. Misdiagnosis can be fatal.' },
      ]),
    },
    {
      type: 'behavioral', severity: 'medium',
      scenario: `Your ${petType} has destroyed a couch cushion while you were at work. There are stuffing pieces everywhere.`,
      options: JSON.stringify([
        { id: 'a', text: 'Research separation anxiety solutions and buy enrichment toys', score: 9, cost: 60, explanation: 'Good approach. Destruction often signals boredom or anxiety.' },
        { id: 'b', text: 'Scold the pet when you get home', score: 2, cost: 0, explanation: 'Ineffective. Pets cannot connect past actions to current punishment.' },
        { id: 'c', text: 'Confine pet to a crate all day tomorrow', score: 3, cost: 30, explanation: 'A crate can help short-term but 8+ hours is too long.' },
      ]),
    },
    {
      type: 'schedule_conflict', severity: 'low',
      scenario: 'A last-minute work meeting conflicts with your pet\'s midday walk. You can\'t leave for 3 hours.',
      options: JSON.stringify([
        { id: 'a', text: 'Arrange a dog walker via app', score: 9, cost: 25, explanation: 'Great planning. Building a backup care network is essential.' },
        { id: 'b', text: 'Skip the walk today', score: 5, cost: 0, explanation: 'Acceptable occasionally but shouldn\'t become a pattern.' },
        { id: 'c', text: 'Leave meeting early', score: 6, cost: 0, explanation: 'Shows commitment but may not always be feasible.' },
      ]),
    },
    {
      type: 'property_damage', severity: 'medium',
      scenario: `Your neighbor complains that your ${petType} is making noise during the day. They threaten to report to building management.`,
      options: JSON.stringify([
        { id: 'a', text: 'Apologize, research noise-reduction training, get white noise machine', score: 9, cost: 80, explanation: 'Proactive and considerate. Good neighbor relations protect your living situation.' },
        { id: 'b', text: 'Ignore it — pets make noise', score: 2, cost: 0, explanation: 'Risky. Noise complaints can lead to eviction or forced rehoming.' },
        { id: 'c', text: 'Consider rehoming the pet', score: 1, cost: 0, explanation: 'Giving up at the first challenge is exactly what PetReady aims to prevent.' },
      ]),
    },
  ];

  // Pick 1-2 random events
  const numEvents = days >= 5 ? 2 : 1;
  const shuffled = eventPool.sort(() => Math.random() - 0.5).slice(0, numEvents);

  for (let i = 0; i < shuffled.length; i++) {
    const evt = shuffled[i];
    const triggerDate = new Date(startDate);
    triggerDate.setDate(triggerDate.getDate() + Math.floor(Math.random() * days));
    triggerDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    await client.query(
      `INSERT INTO events (simulation_id, type, severity, scenario, options, triggered_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [simulationId, evt.type, evt.severity, evt.scenario, evt.options, triggerDate],
    );
  }
}

/** Get the currently active simulation for a user with task progress stats. */
export async function getActiveSimulation(userId: string) {
  const { rows } = await db.query(
    `SELECT s.*, 
      (SELECT COUNT(*) FROM tasks WHERE simulation_id = s.id AND completed_at IS NOT NULL) as tasks_completed,
      (SELECT COUNT(*) FROM tasks WHERE simulation_id = s.id) as tasks_total,
      (SELECT COUNT(*) FROM tasks WHERE simulation_id = s.id AND missed = TRUE) as tasks_missed
     FROM simulations s WHERE s.user_id = $1 AND s.status = 'active'`,
    [userId],
  );
  return rows[0] || null;
}

/** Mark a task as completed and score it based on response time. Enforces time windows. */
export async function completeTask(taskId: string, userId: string) {
  const { rows: tasks } = await db.query(
    `SELECT t.*, s.user_id FROM tasks t JOIN simulations s ON t.simulation_id = s.id
     WHERE t.id = $1`,
    [taskId],
  );
  if (tasks.length === 0) throw new NotFoundError('Task');
  if (tasks[0].user_id !== userId) throw new NotFoundError('Task');
  if (tasks[0].completed_at) return { ...tasks[0], message: 'Already completed' };
  if (tasks[0].missed) return { ...tasks[0], message: 'This task was already marked as missed' };

  const scheduledAt = new Date(tasks[0].scheduled_at).getTime();
  const now = Date.now();
  const WINDOW_BEFORE = 30 * 60 * 1000;  // Can complete 30 min early
  const WINDOW_AFTER = 120 * 60 * 1000;  // 2 hour grace period after scheduled time

  // Too early — task hasn't started yet
  if (now < scheduledAt - WINDOW_BEFORE) {
    return { error: true, message: `This task isn't available yet. Come back at ${new Date(scheduledAt - WINDOW_BEFORE).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
  }

  // Too late — auto-missed
  if (now > scheduledAt + WINDOW_AFTER) {
    await db.query('UPDATE tasks SET missed = TRUE WHERE id = $1', [taskId]);
    return { ...tasks[0], missed: true, message: getConsequence(tasks[0].type, 'missed') };
  }

  // Within window — score based on response speed
  const responseTime = now - scheduledAt;
  // Perfect = 10, decays to 5 at 30min, 2 at 1hr, 0 at 2hr
  const score = Math.max(0, Math.round((10 - (responseTime / (1000 * 60 * 30)) * 3) * 10) / 10);

  const { rows } = await db.query(
    `UPDATE tasks SET completed_at = NOW(), response_time_ms = $1, score = $2
     WHERE id = $3 RETURNING *`,
    [Math.max(0, responseTime), score, taskId],
  );

  const feedback = getCompletionFeedback(tasks[0].type, responseTime);
  return { ...rows[0], message: feedback };
}

/** Get a consequence narrative for a missed task. */
function getConsequence(taskType: string, _reason: string): string {
  const consequences: Record<string, string> = {
    feeding: "Your pet went hungry. They're pacing near their empty bowl and whining.",
    walking: "Your dog hasn't been outside in hours. There's an accident on the floor.",
    grooming: "The litter box is overflowing. Your cat started going outside the box.",
    play: "Your pet is restless and anxious. They started chewing on furniture.",
    training: "Without practice, your pet forgot yesterday's progress. Training takes consistency.",
  };
  return consequences[taskType] || "Your pet needed you, but you weren't there.";
}

/** Get positive feedback for completing a task on time. */
function getCompletionFeedback(taskType: string, responseTimeMs: number): string {
  const minutes = Math.round(responseTimeMs / (1000 * 60));
  if (minutes <= 5) {
    const quick: Record<string, string> = {
      feeding: "Your pet ate happily! They wagged their tail seeing you prepare food.",
      walking: "Great walk! Your dog is energized and content.",
      grooming: "Clean and fresh. Your pet seems relieved.",
      play: "So much fun! Your pet is tired and happy.",
      training: "Excellent session! Your pet learned something new today.",
    };
    return quick[taskType] || "Done! Your pet appreciates the care.";
  }
  if (minutes <= 30) {
    return "Completed. Your pet waited a bit but all is well.";
  }
  return "Done, but your pet was getting anxious waiting. Try to respond sooner next time.";
}

/** Record a user's response to a simulation event. Penalizes if response is after 30-minute window. */
export async function respondToEvent(eventId: string, userId: string, choice: string) {
  const { rows: events } = await db.query(
    `SELECT e.*, s.user_id FROM events e JOIN simulations s ON e.simulation_id = s.id
     WHERE e.id = $1`,
    [eventId],
  );
  if (events.length === 0) throw new NotFoundError('Event');
  if (events[0].user_id !== userId) throw new NotFoundError('Event');
  if (events[0].responded_at) return { scoreImpact: 0, financialImpact: 0, explanation: 'Already responded to this event.' };

  const options = typeof events[0].options === 'string' ? JSON.parse(events[0].options) : events[0].options;
  const selected = options.find((o: { id: string }) => o.id === choice);
  if (!selected) throw new NotFoundError('Option');

  const responseTime = Date.now() - new Date(events[0].triggered_at).getTime();
  const URGENCY_WINDOW = 30 * 60 * 1000; // 30 minutes

  // Penalize late responses — reduce score by half if over 30 min
  let finalScore = selected.score;
  let lateMessage = '';
  if (responseTime > URGENCY_WINDOW) {
    finalScore = Math.round(selected.score * 0.5);
    lateMessage = ' (Penalty: responded too slowly — in a real emergency, every minute counts)';
  }

  await db.query(
    `UPDATE events SET user_response = $1, response_time_ms = $2, financial_impact = $3,
     score_impact = $4, explanation = $5, responded_at = NOW()
     WHERE id = $6`,
    [choice, responseTime, selected.cost, finalScore, selected.explanation, eventId],
  );

  await db.query(
    `UPDATE simulations SET total_expenses = total_expenses + $1 WHERE id = $2`,
    [selected.cost, events[0].simulation_id],
  );

  return {
    scoreImpact: finalScore,
    financialImpact: selected.cost,
    explanation: selected.explanation + lateMessage,
    wasLate: responseTime > URGENCY_WINDOW,
    responseMinutes: Math.round(responseTime / (1000 * 60)),
  };
}
