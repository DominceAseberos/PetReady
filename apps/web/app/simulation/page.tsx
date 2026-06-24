'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, PawPrint } from 'lucide-react';

interface Task { id: string; type: string; title: string; day_number: number; scheduled_at: string; completed_at: string | null; missed: boolean; score: number | null; }
interface Event { id: string; type: string; severity: string; scenario: string; options: { id: string; text: string }[]; responded_at: string | null; }
interface Simulation { id: string; pet_type: string; duration_days: number; status: string; total_expenses: number; tasks_completed: string; tasks_total: string; tasks_missed: string; start_date: string; }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export default function SimulationPage() {
  const [sim, setSim] = useState<Simulation | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch(`${API}/v1/simulations/active`, { headers: getHeaders() });
    if (!res.ok) { setLoading(false); return; }
    const simData = await res.json();
    setSim(simData);

    const [tasksRes, eventsRes] = await Promise.all([
      fetch(`${API}/v1/simulations/${simData.id}/tasks`, { headers: getHeaders() }),
      fetch(`${API}/v1/simulations/${simData.id}/events`, { headers: getHeaders() }),
    ]);
    if (tasksRes.ok) { const d = await tasksRes.json(); setTasks(d.tasks); }
    if (eventsRes.ok) { const d = await eventsRes.json(); setEvents(d.events); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const completeTask = async (taskId: string) => {
    await fetch(`${API}/v1/simulations/tasks/${taskId}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ completed: true }) });
    fetchData();
  };

  const respondEvent = async (eventId: string, choice: string) => {
    await fetch(`${API}/v1/simulations/events/${eventId}/respond`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ choice }) });
    fetchData();
  };

  const completeSim = async () => {
    if (!sim) return;
    const res = await fetch(`${API}/v1/simulations/${sim.id}/complete`, { method: 'POST', headers: getHeaders() });
    if (res.ok) window.location.href = `/results?sim=${sim.id}`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-gray-500">Loading simulation...</p></div>;
  if (!sim) return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-gray-900">No active simulation</h1>
      <p className="mt-2 text-gray-600">Take the quiz first to start your simulation.</p>
      <a href="/quiz" className="mt-6 inline-block rounded-md bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700">Start Quiz</a>
    </main>
  );

  const currentDay = Math.min(sim.duration_days, Math.ceil((Date.now() - new Date(sim.start_date).getTime()) / (1000 * 60 * 60 * 24)));
  const todayTasks = tasks.filter((t) => t.day_number === currentDay);
  const pendingEvents = events.filter((e) => !e.responded_at);
  const allTasksDone = tasks.every((t) => t.completed_at || t.missed);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <nav className="flex items-center justify-between mb-8" data-testid="sim-nav">
        <div className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-primary-600" strokeWidth={1.8} />
          <span className="font-display font-bold">PetReady</span>
        </div>
        <span className="text-sm font-medium text-gray-500" data-testid="sim-status">Day {currentDay} of {sim.duration_days}</span>
      </nav>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8" data-testid="sim-stats">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-900">{sim.tasks_completed}/{sim.tasks_total}</p>
          <p className="text-xs text-gray-500">Tasks Done</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-900">{sim.tasks_missed}</p>
          <p className="text-xs text-gray-500">Missed</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-900">${Number(sim.total_expenses).toFixed(0)}</p>
          <p className="text-xs text-gray-500">Expenses</p>
        </div>
      </div>

      {/* Pending Events */}
      {pendingEvents.map((evt) => (
        <div key={evt.id} className="mb-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-5" data-testid="event-card">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-sm font-bold uppercase">Unexpected Event</span>
          </div>
          <p className="text-sm text-gray-800">{evt.scenario}</p>
          <div className="mt-4 space-y-2">
            {evt.options.map((opt) => (
              <button key={opt.id} onClick={() => respondEvent(evt.id, opt.id)}
                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-left text-sm hover:border-primary-400 hover:bg-primary-50 transition-colors">
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Today's Tasks */}
      <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Today&apos;s Tasks</h2>
      <div className="space-y-3" data-testid="task-list">
        {todayTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            {task.completed_at ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-gray-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.completed_at ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
              <p className="text-xs text-gray-500">{new Date(task.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {!task.completed_at && !task.missed && (
              <button onClick={() => completeTask(task.id)}
                className="shrink-0 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700" data-testid={`complete-${task.id}`}>
                Done
              </button>
            )}
            {task.missed && <span className="text-xs text-red-500 font-medium">Missed</span>}
          </div>
        ))}
      </div>

      {/* Complete Simulation Button */}
      {allTasksDone && pendingEvents.length === 0 && (
        <div className="mt-8 text-center">
          <button onClick={completeSim} className="rounded-md bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700" data-testid="complete-sim">
            View My Results
          </button>
        </div>
      )}
    </main>
  );
}
