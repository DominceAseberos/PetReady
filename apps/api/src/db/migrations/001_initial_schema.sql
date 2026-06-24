-- 001: Initial schema for PetReady
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_prefs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Assessments (lifestyle quiz responses)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  recommended_pet_type VARCHAR(50),
  recommended_pet_size VARCHAR(20),
  living_space_score INT,
  financial_score INT,
  schedule_score INT,
  experience_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulations
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id),
  pet_type VARCHAR(20) NOT NULL,
  pet_size VARCHAR(20),
  duration_days INT NOT NULL DEFAULT 3,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  total_expenses DECIMAL(10,2) DEFAULT 0,
  budget_stated DECIMAL(10,2),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks within simulations
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  day_number INT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  response_time_ms INT,
  missed BOOLEAN DEFAULT FALSE,
  score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Random events during simulation
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  scenario TEXT NOT NULL,
  options JSONB NOT NULL,
  user_response VARCHAR(50),
  response_time_ms INT,
  financial_impact DECIMAL(10,2) DEFAULT 0,
  score_impact DECIMAL(5,2),
  explanation TEXT,
  triggered_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ
);

-- Readiness results
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID UNIQUE NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_score INT NOT NULL,
  time_score INT,
  financial_score INT,
  living_score INT,
  flexibility_score INT,
  experience_score INT,
  emotional_score INT,
  household_score INT,
  score_label VARCHAR(30),
  recommendations JSONB,
  strengths JSONB,
  gaps JSONB,
  share_token VARCHAR(32) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preparation checklist items
CREATE TABLE preparation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50),
  action_item TEXT NOT NULL,
  timeframe VARCHAR(50),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-up check-ins
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  result_id UUID REFERENCES results(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  adopted BOOLEAN,
  satisfaction_score INT,
  notes TEXT
);

-- Notification log
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_simulations_user_status ON simulations(user_id, status);
CREATE INDEX idx_tasks_simulation_scheduled ON tasks(simulation_id, scheduled_at);
CREATE INDEX idx_tasks_missed ON tasks(simulation_id) WHERE missed = TRUE;
CREATE INDEX idx_events_simulation ON events(simulation_id);
CREATE INDEX idx_results_user ON results(user_id);
CREATE INDEX idx_results_share_token ON results(share_token);
CREATE INDEX idx_preparation_items_user ON preparation_items(user_id, completed);
CREATE INDEX idx_notification_log_task ON notification_log(task_id);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
