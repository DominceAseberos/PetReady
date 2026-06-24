'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast, Toaster } from 'sonner';
import { CheckCircle2, Clock, AlertTriangle, PawPrint, Dog, Cat, DollarSign } from 'lucide-react';

interface Task { id: string; type: string; title: string; description: string; day_number: number; scheduled_at: string; completed_at: string | null; missed: boolean; score: number | null; }
interface SimEvent { id: string; type: string; severity: string; scenario: string; options: { id: string; text: string }[]; triggered_at: string; responded_at: string | null; }
interface Simulation { id: string; pet_type: string; pet_size: string; duration_days: number; status: string; total_expenses: number; budget_stated: number; tasks_completed: string; tasks_total: string; tasks_missed: string; start_date: string; }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }; }

const PET_NAMES: Record<string, string> = { dog: 'Buddy', cat: 'Luna' };
const PET_ICONS: Record<string, typeof Dog> = { dog: Dog, cat: Cat };

export default function SimulationPage() {
  const [sim, setSim] = useState<Simulation | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/v1/simulations/active`, { headers: headers() });
      if (!res.ok) { setLoading(false); return; }
      const simData = await res.json();
      setSim(simData);

      const [tasksRes, eventsRes] = await Promise.all([
        fetch(`${API}/v1/simulations/${simData.id}/tasks`, { headers: headers() }),
        fetch(`${API}/v1/simulations/${simData.id}/events`, { headers: headers() }),
      ]);
      if (tasksRes.ok) setTasks((await tasksRes.json()).tasks);
      if (eventsRes.ok) setEvents((await eventsRes.json()).events);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API}/v1/simulations/tasks/${taskId}`, { method: 'PATCH', headers: headers(), body: '{}' });
      const data = await res.json();
      if (data.error) {
        toast.error(data.message);
      } else if (data.missed) {
        toast.error(data.message, { duration: 5000 });
      } else {
        toast.success(data.message || 'Task completed!', { duration: 4000 });
      }
      fetchData();
    } catch { toast.error('Network error'); }
  };

  const respondEvent = async (eventId: string, choice: string) => {
    setResponding(eventId);
    try {
      const res = await fetch(`${API}/v1/simulations/events/${eventId}/respond`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ choice }),
      });
      const data = await res.json();
      if (data.wasLate) {
        toast.warning(`${data.explanation}`, { duration: 6000 });
      } else {
        toast.success(data.explanation, { duration: 5000 });
      }
      if (data.financialImpact > 0) {
        toast(`💰 Cost: $${data.financialImpact}`, { duration: 3000 });
      }
      fetchData();
    } catch { toast.error('Network error'); }
    setResponding(null);
  };

  const completeSim = async () => {
    if (!sim) return;
    try {
      const res = await fetch(`${API}/v1/simulations/${sim.id}/complete`, { method: 'POST', headers: headers() });
      if (res.ok) window.location.href = `/results?sim=${sim.id}`;
      else toast.error('Cannot complete yet — finish pending tasks and events first.');
    } catch { toast.error('Network error'); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-pulse text-center"><PawPrint className="mx-auto h-10 w-10 text-primary-300" /><p className="mt-3 text-sm text-gray-400">Loading your simulation...</p></div></div>;
  if (!sim) return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <PawPrint className="mx-auto h-10 w-10 text-gray-300" />
      <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">No active simulation</h1>
      <p className="mt-2 text-gray-600">Ready to see if you can handle pet ownership?</p>
      <a href="/start" className="mt-6 inline-block rounded-md bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700" data-testid="go-to-start">Set up simulation</a>
    </main>
  );

  const currentDay = Math.min(sim.duration_days, Math.max(1, Math.ceil((Date.now() - new Date(sim.start_date).getTime()) / (1000 * 60 * 60 * 24))));
  const todayTasks = tasks.filter((t) => t.day_number === currentDay);
  const pendingEvents = events.filter((e) => !e.responded_at && new Date(e.triggered_at) <= new Date());
  const completedCount = parseInt(sim.tasks_completed) || tasks.filter(t => t.completed_at).length;
  const totalCount = parseInt(sim.tasks_total) || tasks.length;
  const missedCount = parseInt(sim.tasks_missed) || tasks.filter(t => t.missed).length;
  const canFinish = currentDay >= sim.duration_days && pendingEvents.length === 0;

  const petName = PET_NAMES[sim.pet_type] || 'Your pet';
  const PetIcon = PET_ICONS[sim.pet_type] || PawPrint;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Toaster position="top-center" richColors closeButton />

      {/* Header with pet persona */}
      <header className="flex items-center justify-between mb-6" data-testid="sim-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
            <PetIcon className="h-5 w-5 text-primary-700" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-display font-bold text-gray-900">{petName}</p>
            <p className="text-xs text-gray-500">Day {currentDay} of {sim.duration_days} • {sim.pet_type} ({sim.pet_size || 'standard'})</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Progress</p>
          <p className="text-sm font-bold text-primary-600">{progressPct}%</p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-100 mb-6" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-2 rounded-full bg-primary-500" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6" data-testid="sim-stats">
        <div className="rounded-lg bg-white p-3 border border-gray-100 text-center">
          <p className="text-xl font-bold text-gray-900">{completedCount}<span className="text-sm font-normal text-gray-400">/{totalCount}</span></p>
          <p className="text-xs text-gray-500">Tasks done</p>
        </div>
        <div className="rounded-lg bg-white p-3 border border-gray-100 text-center">
          <p className={`text-xl font-bold ${missedCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{missedCount}</p>
          <p className="text-xs text-gray-500">Missed</p>
        </div>
        <div className="rounded-lg bg-white p-3 border border-gray-100 text-center">
          <p className="text-xl font-bold text-gray-900 flex items-center justify-center gap-0.5"><DollarSign className="h-4 w-4" />{Number(sim.total_expenses).toFixed(0)}</p>
          <p className="text-xs text-gray-500">Spent</p>
        </div>
      </div>

      {/* Pending Events (URGENT — always shown first) */}
      <AnimatePresence>
        {pendingEvents.map((evt) => {
          const minutesSince = Math.round((Date.now() - new Date(evt.triggered_at).getTime()) / (1000 * 60));
          const urgencyLeft = Math.max(0, 30 - minutesSince);
          return (
            <motion.div key={evt.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="mb-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-5" data-testid="event-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-sm font-bold uppercase">Emergency</span>
                </div>
                <span className={`text-xs font-mono font-bold ${urgencyLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-amber-700'}`}>
                  {urgencyLeft > 0 ? `${urgencyLeft} min left` : 'OVERDUE'}
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{evt.scenario}</p>
              <div className="mt-4 space-y-2">
                {evt.options.map((opt) => (
                  <button key={opt.id} onClick={() => respondEvent(evt.id, opt.id)} disabled={responding === evt.id}
                    className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-left text-sm hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50"
                    data-testid={`event-option-${opt.id}`}>
                    {opt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Today's Tasks */}
      <h2 className="font-display text-base font-bold text-gray-900 mb-3">
        Today&apos;s tasks
        <span className="ml-2 text-xs font-normal text-gray-400">
          {todayTasks.filter(t => t.completed_at).length}/{todayTasks.length} done
        </span>
      </h2>

      <div className="space-y-2" data-testid="task-list">
        <AnimatePresence>
          {todayTasks.map((task) => {
            const scheduledTime = new Date(task.scheduled_at);
            const isAvailable = !task.completed_at && !task.missed && Date.now() >= scheduledTime.getTime() - 30 * 60 * 1000;
            const timeLabel = task.completed_at
              ? `Done ${formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}`
              : task.missed
              ? 'Missed'
              : isAvailable
              ? 'Available now'
              : `Opens ${formatDistanceToNow(scheduledTime, { addSuffix: true })}`;

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 rounded-lg bg-white p-4 border transition-all ${task.completed_at ? 'border-green-100 bg-green-50/30' : task.missed ? 'border-red-100 bg-red-50/30' : isAvailable ? 'border-primary-200' : 'border-gray-100 opacity-60'}`}>
                {task.completed_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : task.missed ? (
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                ) : (
                  <Clock className={`h-5 w-5 shrink-0 ${isAvailable ? 'text-primary-500' : 'text-gray-300'}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed_at ? 'text-gray-400 line-through' : task.missed ? 'text-red-700' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className={`text-xs ${task.missed ? 'text-red-500' : 'text-gray-500'}`}>{timeLabel}</p>
                </div>
                {isAvailable && !task.completed_at && !task.missed && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => completeTask(task.id)}
                    className="shrink-0 rounded-md bg-primary-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
                    data-testid={`complete-${task.id}`}>
                    Done ✓
                  </motion.button>
                )}
                {task.score !== null && (
                  <span className="text-xs font-medium text-primary-600">+{task.score}</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Complete simulation CTA */}
      {canFinish && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-3">Simulation complete! Ready to see how you did?</p>
          <button onClick={completeSim}
            className="rounded-md bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700 shadow-sm"
            data-testid="view-results-btn">
            View my readiness score
          </button>
        </motion.div>
      )}

      {/* Pet mood footer */}
      <div className="mt-8 rounded-lg bg-gray-50 p-4 border border-gray-100 text-center" data-testid="pet-mood">
        <p className="text-sm text-gray-600">
          {missedCount === 0 && completedCount > 0
            ? `🐾 ${petName} is happy and well-cared for. Keep it up!`
            : missedCount > 2
            ? `😿 ${petName} is feeling neglected. They need more attention.`
            : missedCount > 0
            ? `🐾 ${petName} missed you earlier. Try not to let it happen again.`
            : `🐾 ${petName} is waiting for your first task. Check back soon!`}
        </p>
      </div>
    </main>
  );
}
