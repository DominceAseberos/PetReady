'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PawPrint, Share2, CheckCircle2 } from 'lucide-react';

interface Result {
  overall_score: number; score_label: string;
  time_score: number; financial_score: number; living_score: number;
  flexibility_score: number; experience_score: number; emotional_score: number; household_score: number;
  strengths: string[]; gaps: string[]; recommendations: { category: string; message: string; priority: string }[];
  share_token: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const LABELS: Record<string, { text: string; color: string }> = {
  highly_ready: { text: 'Highly Ready', color: 'text-green-600' },
  mostly_ready: { text: 'Mostly Ready', color: 'text-primary-600' },
  needs_preparation: { text: 'Needs Preparation', color: 'text-amber-600' },
  not_ready: { text: 'Not Yet Ready', color: 'text-red-600' },
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-primary-500 transition-all duration-700" style={{ width: `${score}%` }} />
      </div>
      <span className="w-8 text-xs font-medium text-gray-700 text-right">{score}</span>
    </div>
  );
}

export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <ResultsPage />
    </Suspense>
  );
}

function ResultsPage() {
  const params = useSearchParams();
  const simId = params.get('sim');
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!simId) return;
    const token = localStorage.getItem('token');
    fetch(`${API}/v1/simulations/${simId}/results`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.ok ? r.json() : null).then(setResult);
  }, [simId]);

  if (!result) return <div className="flex h-screen items-center justify-center"><p className="text-gray-500">Loading results...</p></div>;

  const labelInfo = LABELS[result.score_label] || LABELS.needs_preparation;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${result.share_token}`;
  const handleShare = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <nav className="flex items-center gap-2 mb-12">
        <PawPrint className="h-5 w-5 text-primary-600" strokeWidth={1.8} />
        <span className="font-display font-bold text-gray-900">PetReady</span>
      </nav>

      {/* Score Hero */}
      <section className="text-center mb-12" data-testid="score-hero">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your Readiness Score</p>
        <p className="mt-2 font-display text-6xl font-extrabold text-gray-900" data-testid="overall-score">{result.overall_score}</p>
        <p className={`mt-1 text-lg font-semibold ${labelInfo.color}`}>{labelInfo.text}</p>
      </section>

      {/* Score Breakdown */}
      <section className="space-y-3 mb-12" data-testid="score-breakdown">
        <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Score Breakdown</h2>
        <ScoreBar label="Time (25%)" score={result.time_score} />
        <ScoreBar label="Financial (20%)" score={result.financial_score} />
        <ScoreBar label="Living (15%)" score={result.living_score} />
        <ScoreBar label="Flexibility (15%)" score={result.flexibility_score} />
        <ScoreBar label="Experience (10%)" score={result.experience_score} />
        <ScoreBar label="Emotional (10%)" score={result.emotional_score} />
        <ScoreBar label="Household (5%)" score={result.household_score} />
      </section>

      {/* Strengths & Gaps */}
      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        <section data-testid="strengths">
          <h3 className="font-display text-base font-semibold text-green-700 mb-3">Strengths</h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </section>
        <section data-testid="gaps">
          <h3 className="font-display text-base font-semibold text-amber-700 mb-3">Areas to Improve</h3>
          <ul className="space-y-2">
            {result.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="h-4 w-4 shrink-0 mt-0.5 text-amber-500">•</span> {g}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <section className="mb-12" data-testid="recommendations">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Your Preparation Plan</h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${rec.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {rec.priority} priority
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Share */}
      <div className="text-center">
        <button onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50" data-testid="share-btn">
          <Share2 className="h-4 w-4" /> {copied ? 'Link copied!' : 'Share results'}
        </button>
      </div>
    </main>
  );
}
