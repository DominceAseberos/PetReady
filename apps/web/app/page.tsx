import { PawPrint, Clock, BarChart3, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      {/* Header */}
      <nav className="flex items-center justify-between" data-testid="nav">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary-600" strokeWidth={1.8} />
          <span className="font-display text-lg font-bold text-gray-900">PetReady</span>
        </div>
        <a
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
          data-testid="login-link"
        >
          Sign in
        </a>
      </nav>

      {/* Hero — no gradient, no floating elements, just clear value */}
      <section className="mt-20 text-center" data-testid="hero">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Are you <span className="text-primary-600">really</span> ready for a pet?
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600">
          Don&apos;t guess. Experience it first. Our 3-day simulation shows you what pet ownership
          actually feels like — before you commit.
        </p>
        <a
          href="/quiz"
          className="mt-8 inline-flex items-center rounded-md bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
          data-testid="cta-start"
        >
          Start free simulation
        </a>
        <p className="mt-3 text-sm text-gray-500">No app download. Works in your browser.</p>
      </section>

      {/* How it works — asymmetric layout for visual tension */}
      <section className="mt-24" data-testid="how-it-works">
        <h2 className="font-display text-2xl font-bold text-gray-900">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Step
            number={1}
            icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />}
            title="Take the quiz"
            description="5 minutes on your lifestyle, schedule, and finances."
          />
          <Step
            number={2}
            icon={<Clock className="h-5 w-5" strokeWidth={1.8} />}
            title="Live the simulation"
            description="3 days of real-time tasks, surprises, and decisions."
          />
          <Step
            number={3}
            icon={<BarChart3 className="h-5 w-5" strokeWidth={1.8} />}
            title="Get your score"
            description="Honest readiness score with a personalized prep plan."
          />
        </div>
      </section>

      {/* Social proof — one real quote, not generic */}
      <section className="mt-24 border-l-2 border-primary-200 pl-6" data-testid="testimonial">
        <blockquote className="text-lg italic text-gray-700">
          &ldquo;I thought I was ready. PetReady showed me 3 things I hadn&apos;t considered.
          Now I&apos;m actually prepared.&rdquo;
        </blockquote>
        <p className="mt-2 text-sm font-medium text-gray-500">— Future dog owner, 28</p>
      </section>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
        <p>PetReady — reducing pet abandonment, one simulation at a time.</p>
      </footer>
    </main>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col" data-testid={`step-${number}`}>
      <div className="flex items-center gap-2 text-primary-600">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Step {number}
        </span>
      </div>
      <h3 className="mt-2 font-display text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}
