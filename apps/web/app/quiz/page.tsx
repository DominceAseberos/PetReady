'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, PawPrint } from 'lucide-react';

const QUESTIONS = [
  { key: 'living_space', label: 'What type of home do you live in?', type: 'select', options: [
    { value: 'apartment_small', label: 'Small apartment' }, { value: 'apartment_large', label: 'Large apartment' },
    { value: 'house_small', label: 'Small house' }, { value: 'house_large', label: 'Large house' }, { value: 'farm', label: 'Farm/rural property' },
  ]},
  { key: 'has_yard', label: 'Do you have a yard or outdoor space?', type: 'boolean' },
  { key: 'work_schedule', label: 'What is your typical work schedule?', type: 'select', options: [
    { value: '9to5_office', label: '9-5 in office' }, { value: 'remote', label: 'Work from home' },
    { value: 'hybrid', label: 'Hybrid (some days home)' }, { value: 'shift_work', label: 'Shift work / irregular' },
    { value: 'freelance', label: 'Freelance / flexible' },
  ]},
  { key: 'hours_away_daily', label: 'How many hours are you away from home daily?', type: 'number', min: 0, max: 24 },
  { key: 'monthly_income_range', label: 'What is your monthly income range?', type: 'select', options: [
    { value: 'under_2000', label: 'Under $2,000' }, { value: '2000-3000', label: '$2,000 – $3,000' },
    { value: '3000-5000', label: '$3,000 – $5,000' }, { value: '5000-8000', label: '$5,000 – $8,000' },
    { value: 'over_8000', label: 'Over $8,000' },
  ]},
  { key: 'monthly_pet_budget', label: 'How much can you spend monthly on a pet?', type: 'number', min: 0, max: 5000 },
  { key: 'family_members', label: 'How many people live in your household?', type: 'number', min: 1, max: 20 },
  { key: 'existing_pets', label: 'Do you currently have any pets?', type: 'multi', options: [
    { value: 'none', label: 'No pets' }, { value: 'dog', label: 'Dog' }, { value: 'cat', label: 'Cat' }, { value: 'other', label: 'Other' },
  ]},
  { key: 'travel_frequency', label: 'How often do you travel overnight?', type: 'select', options: [
    { value: 'rarely', label: 'Rarely (few times a year)' }, { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' }, { value: 'never', label: 'Never' },
  ]},
  { key: 'prior_pet_experience', label: 'What is your pet care experience?', type: 'select', options: [
    { value: 'none', label: 'No experience' }, { value: 'childhood_only', label: 'Had pets as a child' },
    { value: 'roommate_had_pet', label: "Roommate/partner's pet" }, { value: 'owned_briefly', label: 'Owned briefly (< 2 years)' },
    { value: 'current_owner', label: 'Current/long-term owner' }, { value: 'professional', label: 'Professional experience' },
  ]},
  { key: 'reason_for_adopting', label: 'Why do you want a pet?', type: 'select', options: [
    { value: 'companionship', label: 'Companionship' }, { value: 'family', label: 'For the family/kids' },
    { value: 'exercise', label: 'Motivation to exercise' }, { value: 'emotional_support', label: 'Emotional support' },
    { value: 'always_wanted', label: "Always wanted one" },
  ]},
  { key: 'commitment_years', label: 'How long are you prepared to care for a pet?', type: 'select', options: [
    { value: '1-3', label: '1–3 years' }, { value: '3-5', label: '3–5 years' },
    { value: '5-10', label: '5–10 years' }, { value: '10+', label: '10+ years (lifetime)' },
  ]},
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ recommended_pet_type: string; sub_scores: Record<string, number> } | null>(null);

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const setAnswer = (value: unknown) => {
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
  };

  const canNext = answers[q.key] !== undefined && answers[q.key] !== '' && answers[q.key] !== null;

  const handleSubmit = async () => {
    // Fix existing_pets to always be an array
    const existingPets = answers.existing_pets;
    const petsArray = existingPets === 'none' || !existingPets ? [] : [existingPets as string];
    const payload = { responses: { ...answers, existing_pets: petsArray } };
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Submission failed. Please try again.');
      }
    } catch {
      alert('Network error. Please check your connection.');
    }
  };

  if (submitted && result) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <PawPrint className="mx-auto h-12 w-12 text-primary-600" strokeWidth={1.8} />
        <h1 className="mt-4 font-display text-3xl font-bold text-gray-900">Assessment Complete</h1>
        <p className="mt-2 text-gray-600">Based on your lifestyle, we recommend:</p>
        <p className="mt-4 text-2xl font-bold text-primary-600 capitalize">{result.recommended_pet_type}</p>
        <a href="/simulation" className="mt-8 inline-block rounded-md bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700" data-testid="start-sim">
          Start Simulation
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <nav className="flex items-center gap-2 mb-8">
        <PawPrint className="h-5 w-5 text-primary-600" strokeWidth={1.8} />
        <span className="font-display font-bold text-gray-900">PetReady</span>
        <span className="ml-auto text-sm text-gray-500">Question {step + 1} of {QUESTIONS.length}</span>
      </nav>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-200 mb-8" data-testid="progress-bar">
        <div className="h-1.5 rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <h2 className="font-display text-xl font-bold text-gray-900" data-testid="quiz-question">{q.label}</h2>

      <div className="mt-6 space-y-3" data-testid="quiz-options">
        {q.type === 'select' && q.options?.map((opt) => (
          <button key={opt.value} onClick={() => setAnswer(opt.value)}
            className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${answers[q.key] === opt.value ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 hover:border-gray-300'}`}>
            {opt.label}
          </button>
        ))}
        {q.type === 'boolean' && (
          <div className="flex gap-3">
            <button onClick={() => setAnswer(true)} className={`flex-1 rounded-md border px-4 py-3 text-sm ${answers[q.key] === true ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>Yes</button>
            <button onClick={() => setAnswer(false)} className={`flex-1 rounded-md border px-4 py-3 text-sm ${answers[q.key] === false ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>No</button>
          </div>
        )}
        {q.type === 'number' && (
          <input type="number" min={q.min} max={q.max} value={(answers[q.key] as number) || ''}
            onChange={(e) => setAnswer(Number(e.target.value))}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        )}
        {q.type === 'multi' && q.options?.map((opt) => (
          <button key={opt.value} onClick={() => setAnswer(opt.value)}
            className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${answers[q.key] === opt.value ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 hover:border-gray-300'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < QUESTIONS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canNext}
            className="flex items-center gap-1 rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canNext}
            className="rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
            Get Results
          </button>
        )}
      </div>
    </main>
  );
}
