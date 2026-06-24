'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PawPrint, Clock, Bell, AlertTriangle, Dog, Cat } from 'lucide-react';
import { motion } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PET_INFO = {
  dog: {
    icon: Dog,
    name: 'Dog',
    tasks: '4–5 tasks/day: feeding, walking, training, play',
    challenge: 'Needs walks rain or shine. Separation anxiety possible.',
    cost: '$200–$400/month average',
  },
  cat: {
    icon: Cat,
    name: 'Cat',
    tasks: '3–4 tasks/day: feeding, litter, play',
    challenge: 'Furniture scratching. Less obvious when sick.',
    cost: '$100–$250/month average',
  },
};

export default function SimulationStartPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<{ id: string; recommended_pet_type: string; recommended_pet_size: string } | null>(null);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petSize, setPetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [duration, setDuration] = useState<3 | 7>(3);
  const [notifGranted, setNotifGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load latest assessment
    const token = localStorage.getItem('token');
    fetch(`${API}/v1/assessments/latest`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setAssessment(data);
          setPetType(data.recommended_pet_type || 'dog');
          setPetSize(data.recommended_pet_size || 'medium');
        }
      });
    // Check notification permission
    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifGranted(perm === 'granted');
    }
  };

  const startSimulation = async () => {
    if (!assessment) { setError('Please complete the lifestyle quiz first.'); return; }
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/v1/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assessment_id: assessment.id,
          pet_type: petType,
          pet_size: petType === 'dog' ? petSize : undefined,
          duration_days: duration,
        }),
      });

      if (res.ok) {
        router.push('/simulation');
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to start simulation');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const pet = PET_INFO[petType];
  const PetIcon = pet.icon;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <nav className="flex items-center gap-2 mb-10">
        <PawPrint className="h-5 w-5 text-primary-600" strokeWidth={1.8} />
        <span className="font-display font-bold text-gray-900">PetReady</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-2xl font-bold text-gray-900">Set up your simulation</h1>
        <p className="mt-1 text-sm text-gray-600">
          For the next {duration} days, you&apos;ll receive real tasks at real times. Treat this like you actually have a pet.
        </p>

        {/* Pet Selection */}
        <section className="mt-8" data-testid="pet-selection">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Choose your pet</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(['dog', 'cat'] as const).map((type) => (
              <button key={type} onClick={() => setPetType(type)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${petType === type ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                data-testid={`pet-${type}`}
              >
                {type === 'dog' ? <Dog className="h-8 w-8 text-primary-600" strokeWidth={1.5} /> : <Cat className="h-8 w-8 text-primary-600" strokeWidth={1.5} />}
                <span className="text-sm font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Size (dog only) */}
        {petType === 'dog' && (
          <section className="mt-6" data-testid="size-selection">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dog size</h2>
            <div className="mt-3 flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button key={size} onClick={() => setPetSize(size)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${petSize === size ? 'border-primary-600 bg-primary-50 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                  {size}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Duration */}
        <section className="mt-6" data-testid="duration-selection">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Simulation length</h2>
          <div className="mt-3 flex gap-3">
            <button onClick={() => setDuration(3)}
              className={`flex-1 rounded-md border p-3 text-center transition-colors ${duration === 3 ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-lg font-bold text-gray-900">3 days</span>
              <p className="text-xs text-gray-500 mt-0.5">Quick assessment</p>
            </button>
            <button onClick={() => setDuration(7)}
              className={`flex-1 rounded-md border p-3 text-center transition-colors ${duration === 7 ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-lg font-bold text-gray-900">7 days</span>
              <p className="text-xs text-gray-500 mt-0.5">Full experience</p>
            </button>
          </div>
        </section>

        {/* What to expect */}
        <section className="mt-8 rounded-lg bg-gray-50 p-4 border border-gray-100" data-testid="what-to-expect">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <PetIcon className="h-4 w-4" /> What to expect
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> {pet.tasks}</li>
            <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /> {pet.challenge}</li>
            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5 shrink-0">$</span> {pet.cost}</li>
          </ul>
        </section>

        {/* Notifications */}
        <section className="mt-6" data-testid="notifications">
          {!notifGranted ? (
            <button onClick={requestNotifications}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors">
              <Bell className="h-4 w-4" /> Enable notifications (recommended)
            </button>
          ) : (
            <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md px-4 py-3 border border-green-100">
              <Bell className="h-4 w-4" /> Notifications enabled — you&apos;ll get task reminders
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Without notifications, you&apos;ll need to check the app manually. The simulation works best with reminders.
          </p>
        </section>

        {/* Error */}
        {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

        {/* Start button */}
        <button onClick={startSimulation} disabled={loading || !assessment}
          className="mt-8 w-full rounded-md bg-primary-600 px-6 py-3.5 text-base font-medium text-white hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 transition-colors"
          data-testid="start-simulation-btn">
          {loading ? 'Starting...' : `Start ${duration}-day simulation`}
        </button>

        {!assessment && (
          <p className="mt-3 text-center text-sm text-amber-600">
            <a href="/quiz" className="underline">Complete the lifestyle quiz</a> before starting.
          </p>
        )}
      </motion.div>
    </main>
  );
}
