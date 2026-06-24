# Functional Requirements

## Document Info
- **Phase**: Requirements
- **Author**: PetReady Team
- **Date**: 2026-06-24
- **Status**: Draft
- **Priority Legend**: P0 = Must have (MVP), P1 = Should have, P2 = Nice to have

---

## 1. User Authentication & Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | User can register with email/password | P0 |
| FR-002 | User can login with Google OAuth | P0 |
| FR-003 | User can reset password via email | P0 |
| FR-004 | User profile stores name, timezone, notification preferences | P0 |
| FR-005 | User can delete account and all associated data | P1 |
| FR-006 | Session persists across browser tabs | P0 |

---

## 2. Lifestyle Assessment (Quiz)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010 | System presents 10–15 lifestyle questions in sequence | P0 |
| FR-011 | Questions cover: living space, work schedule, income range, family, existing pets, travel frequency, experience level | P0 |
| FR-012 | User can go back and change previous answers | P0 |
| FR-013 | Progress bar shows completion percentage | P0 |
| FR-014 | Assessment results stored and retrievable | P0 |
| FR-015 | User can retake assessment (overwrites previous) | P1 |
| FR-016 | Conditional questions based on previous answers (e.g., "existing pets" → "what type?") | P1 |

---

## 3. Pet Selection

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020 | User selects pet type to simulate: Dog, Cat | P0 |
| FR-021 | User selects pet size (small/medium/large for dogs) | P0 |
| FR-022 | System recommends pet types based on assessment answers | P1 |
| FR-023 | Additional pet types: Bird, Rabbit, Fish | P2 |
| FR-024 | Brief description of what the simulation will involve for each type | P0 |

---

## 4. Simulation Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-030 | System creates a 3-day simulation schedule upon start | P0 |
| FR-031 | Optional 7-day simulation (premium) | P1 |
| FR-032 | Each day has 3–5 scheduled tasks at realistic times | P0 |
| FR-033 | Tasks include: feeding, walking, grooming, play, training | P0 |
| FR-034 | Task timing adapts to user's stated timezone and work schedule | P0 |
| FR-035 | User receives browser push notification for each task | P0 |
| FR-036 | Email fallback if push notification not acknowledged in 30 min | P1 |
| FR-037 | User marks task as "completed" with one click | P0 |
| FR-038 | System records completion time (response latency) | P0 |
| FR-039 | Missed tasks are recorded and factor into score | P0 |
| FR-040 | User can pause simulation (max 24h pause per simulation) | P1 |

---

## 5. Unexpected Events

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-050 | System triggers 1–2 random events per simulation | P0 |
| FR-051 | Event types: emergency vet bill, behavioral incident, schedule conflict, property damage | P0 |
| FR-052 | Events present a scenario and require user response (multiple choice) | P0 |
| FR-053 | User response scored on appropriateness and speed | P0 |
| FR-054 | Events appear at unpredictable times (not aligned with regular tasks) | P0 |
| FR-055 | Event outcomes affect running expense total | P0 |
| FR-056 | Multi-pet conflict event (if user indicated existing pets) | P1 |

---

## 6. Expense Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-060 | System maintains running total of simulated pet expenses | P0 |
| FR-061 | Expenses include: food, supplies, vet visits, emergency costs | P0 |
| FR-062 | User sees expense total compared to their stated budget | P0 |
| FR-063 | Monthly/annual projection displayed | P1 |
| FR-064 | "Budget exceeded" warning when simulated costs surpass stated capacity | P0 |

---

## 7. Readiness Score & Results

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-070 | System calculates readiness score (0–100) upon simulation completion | P0 |
| FR-071 | Score factors: time consistency (25%), financial capacity (20%), living situation (15%), schedule flexibility (15%), experience (10%), emotional readiness (10%), household compatibility (5%) | P0 |
| FR-072 | Results page shows overall score with breakdown by factor | P0 |
| FR-073 | Each factor shows specific strengths and gaps | P0 |
| FR-074 | Score ranges: Highly Ready (85–100), Mostly Ready (70–84), Needs Preparation (50–69), Not Yet Ready (<50) | P0 |
| FR-075 | Results are shareable (unique URL or social card) | P1 |
| FR-076 | Historical results stored (user can compare over time) | P2 |

---

## 8. Preparation Plan

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-080 | System generates personalized checklist based on identified gaps | P0 |
| FR-081 | Checklist items are actionable (e.g., "Set up emergency pet fund of $500") | P0 |
| FR-082 | Items linked to relevant resources/guides | P1 |
| FR-083 | User can mark checklist items as done | P1 |
| FR-084 | 30-day follow-up email suggesting re-assessment | P1 |

---

## 9. Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-090 | Browser push notifications for simulation tasks | P0 |
| FR-091 | User grants notification permission during onboarding | P0 |
| FR-092 | Email notifications as fallback | P1 |
| FR-093 | User can customize notification timing preferences | P2 |
| FR-094 | Notification contains task description and one-tap completion link | P0 |

---

## 10. Admin / Analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-100 | Admin dashboard shows total users, active simulations, completion rates | P1 |
| FR-101 | Analytics: funnel visualization (signup → quiz → simulation → completion) | P1 |
| FR-102 | Export anonymized data for research purposes | P2 |
