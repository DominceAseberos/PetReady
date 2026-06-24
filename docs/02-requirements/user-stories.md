# User Stories

## Document Info
- **Phase**: Requirements
- **Author**: PetReady Team
- **Date**: 2026-06-24
- **Status**: Draft

---

## Epic 1: Assessment & Onboarding

### US-001: Account Creation
**As a** prospective pet owner  
**I want to** create an account quickly  
**So that** my simulation progress is saved across sessions

**Acceptance Criteria:**
- Can register with email/password or Google OAuth
- Account creation takes < 60 seconds
- Redirected to lifestyle quiz after signup

### US-002: Lifestyle Quiz
**As a** user  
**I want to** answer questions about my lifestyle  
**So that** the simulation is tailored to my actual situation

**Acceptance Criteria:**
- 10–15 questions presented one at a time
- Progress bar visible at all times
- Can navigate back to change answers
- Completes in under 5 minutes
- Saves partial progress if user leaves

### US-003: Pet Type Selection
**As a** user who completed the quiz  
**I want to** choose which type of pet to simulate  
**So that** I experience the specific responsibilities of that animal

**Acceptance Criteria:**
- Options shown: Dog (small/medium/large), Cat
- Brief description of what simulation involves for each
- System may suggest a recommended type based on quiz answers

---

## Epic 2: Simulation Experience

### US-010: Start Simulation
**As a** user who selected a pet type  
**I want to** begin my multi-day simulation  
**So that** I can experience realistic pet care responsibilities

**Acceptance Criteria:**
- Clear explanation of what to expect (3 days, daily tasks, notifications)
- Notification permission requested with clear explanation of why
- Simulation starts immediately with first task
- Calendar view shows upcoming task schedule

### US-011: Receive Daily Tasks
**As a** user in an active simulation  
**I want to** receive notifications for pet care tasks  
**So that** I experience the real schedule demands of pet ownership

**Acceptance Criteria:**
- 3–5 tasks per day at realistic times (morning feeding, midday walk, evening play)
- Push notification with task description
- Task timing adapts to my timezone and stated work schedule
- Notification links directly to task completion screen

### US-012: Complete a Task
**As a** user who received a task notification  
**I want to** mark the task as done  
**So that** my response time and consistency are tracked

**Acceptance Criteria:**
- One-click completion from notification or app
- System records exact completion time
- Visual confirmation of task done
- Next upcoming task shown

### US-013: Miss a Task
**As a** user who didn't respond to a task  
**I want to** see what I missed and understand the impact  
**So that** I understand the consequences of inconsistency

**Acceptance Criteria:**
- Missed task clearly marked in dashboard
- Brief note explaining real-world consequence (e.g., "Your pet went hungry for 4 hours")
- Score impact visible
- No shaming language — factual and educational

### US-014: Handle Unexpected Event
**As a** user in an active simulation  
**I want to** be presented with surprise challenges  
**So that** I experience the unpredictability of pet ownership

**Acceptance Criteria:**
- Event appears at unexpected time (not aligned with regular tasks)
- Scenario described with context (e.g., "Your dog ate something toxic")
- Multiple choice response options
- Response scored on appropriateness
- Financial impact added to expense tracker
- Educational explanation of best response shown after

---

## Epic 3: Results & Recommendations

### US-020: View Readiness Score
**As a** user who completed the simulation  
**I want to** see my readiness score with detailed breakdown  
**So that** I know specifically where I'm strong and where I need to improve

**Acceptance Criteria:**
- Overall score (0–100) prominently displayed
- Score category label (Highly Ready / Mostly Ready / Needs Preparation / Not Yet Ready)
- Breakdown by factor: time, finances, behavior, emotional, household
- Each factor shows specific evidence from my simulation performance
- Tone is honest but encouraging — guidance, not judgement

### US-021: View Expense Summary
**As a** user who completed the simulation  
**I want to** see the total cost I experienced during simulation  
**So that** I understand the real financial commitment

**Acceptance Criteria:**
- Total simulated expenses shown
- Projected monthly and annual costs
- Comparison to my stated budget
- Emergency fund recommendation
- Breakdown by category (food, vet, supplies, unexpected)

### US-022: Receive Preparation Plan
**As a** user with identified gaps  
**I want to** get specific actions to improve my readiness  
**So that** I know exactly what to do before adopting

**Acceptance Criteria:**
- Personalized checklist generated from my weakest areas
- Each item is specific and actionable (not vague)
- Items have suggested timeframes
- Can mark items as completed
- 30-day follow-up email offered

### US-023: Share Results
**As a** user proud of my score (or wanting accountability)  
**I want to** share my readiness results  
**So that** I can show others or get feedback

**Acceptance Criteria:**
- Shareable link with score summary (no private data)
- Social media card with score and badge
- Option to share with a shelter as pre-screening

---

## Epic 4: Engagement & Retention

### US-030: Retake Assessment
**As a** user who previously scored low  
**I want to** retake the simulation after preparing  
**So that** I can see if my readiness has improved

**Acceptance Criteria:**
- Can start new simulation after completing preparation plan
- Previous results available for comparison
- Progress over time visible

### US-031: Pause Simulation
**As a** user with an unexpected real-life conflict  
**I want to** pause my simulation temporarily  
**So that** I don't get unfairly penalized

**Acceptance Criteria:**
- Pause button available in simulation dashboard
- Maximum 24-hour pause per simulation
- Clear resume time shown
- Tasks do not fire during pause

---

## Epic 5: B2B (Shelter Integration) — Phase 3

### US-040: Shelter Sends Pre-Screening Link
**As a** shelter adoption counselor  
**I want to** send applicants a PetReady assessment link  
**So that** I can see their readiness before processing adoption

**Acceptance Criteria:**
- Shelter has branded link to send applicants
- Applicant's score visible in shelter dashboard (with user consent)
- Score doesn't auto-reject — counselor makes final decision

### US-041: Shelter Views Applicant Readiness
**As a** shelter manager  
**I want to** see aggregated readiness data for all applicants  
**So that** I can prioritize prepared adopters and offer support to others

**Acceptance Criteria:**
- Dashboard showing all applicants with scores
- Filter by score range, pet type, date
- Flag high-risk applicants for additional counseling
- Export data for reporting
