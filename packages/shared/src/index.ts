// Domain types shared between frontend and backend

export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit';
export type PetSize = 'small' | 'medium' | 'large';
export type SimulationStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type TaskType = 'feeding' | 'walking' | 'grooming' | 'play' | 'training';
export type EventType =
  | 'emergency_vet'
  | 'behavioral'
  | 'schedule_conflict'
  | 'property_damage'
  | 'multi_pet_conflict';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ScoreLabel = 'highly_ready' | 'mostly_ready' | 'needs_preparation' | 'not_ready';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
}

export interface Assessment {
  id: string;
  userId: string;
  responses: Record<string, unknown>;
  recommendedPetType: PetType | null;
  recommendedPetSize: PetSize | null;
  createdAt: string;
}

export interface Simulation {
  id: string;
  userId: string;
  assessmentId: string;
  petType: PetType;
  petSize: PetSize | null;
  durationDays: number;
  status: SimulationStatus;
  totalExpenses: number;
  budgetStated: number;
  startDate: string;
  endDate: string | null;
}

export interface Task {
  id: string;
  simulationId: string;
  type: TaskType;
  title: string;
  description: string;
  dayNumber: number;
  scheduledAt: string;
  completedAt: string | null;
  responseTimeMs: number | null;
  missed: boolean;
  score: number | null;
}

export interface SimulationEvent {
  id: string;
  simulationId: string;
  type: EventType;
  severity: EventSeverity;
  scenario: string;
  options: EventOption[];
  userResponse: string | null;
  responseTimeMs: number | null;
  financialImpact: number;
  scoreImpact: number;
  explanation: string;
  triggeredAt: string;
  respondedAt: string | null;
}

export interface EventOption {
  id: string;
  text: string;
  score: number;
  cost: number;
  explanation: string;
}

export interface Result {
  id: string;
  simulationId: string;
  userId: string;
  overallScore: number;
  timeScore: number;
  financialScore: number;
  livingScore: number;
  flexibilityScore: number;
  experienceScore: number;
  emotionalScore: number;
  householdScore: number;
  scoreLabel: ScoreLabel;
  recommendations: Recommendation[];
  strengths: string[];
  gaps: string[];
  shareToken: string;
}

export interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  evidence: string;
}

export interface PreparationItem {
  id: string;
  resultId: string;
  userId: string;
  category: string;
  actionItem: string;
  timeframe: string;
  completed: boolean;
  completedAt: string | null;
}

// API Response types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// Score weights
export const SCORE_WEIGHTS = {
  time: 0.25,
  financial: 0.2,
  living: 0.15,
  flexibility: 0.15,
  experience: 0.1,
  emotional: 0.1,
  household: 0.05,
} as const;

export const SCORE_LABELS: Record<string, { min: number; max: number; label: ScoreLabel }> = {
  highly_ready: { min: 85, max: 100, label: 'highly_ready' },
  mostly_ready: { min: 70, max: 84, label: 'mostly_ready' },
  needs_preparation: { min: 50, max: 69, label: 'needs_preparation' },
  not_ready: { min: 0, max: 49, label: 'not_ready' },
};
