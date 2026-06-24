# System Architecture

## Document Info
- **Phase**: Design
- **Author**: PetReady Team
- **Date**: 2026-06-24
- **Status**: Draft

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser[Web Browser / PWA]
        SW[Service Worker]
    end

    subgraph API["API Layer"]
        NextJS[Next.js Frontend + SSR]
        Express[Express.js API Server]
    end

    subgraph Services["Service Layer"]
        AuthService[Auth Service]
        SimEngine[Simulation Engine]
        ScoreEngine[Score Calculator]
        NotifService[Notification Service]
        EventEngine[Event Generator]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        Redis[(Redis Cache + Queue)]
    end

    subgraph External["External Services"]
        PushAPI[Web Push API]
        EmailSvc[Resend Email]
        Analytics[PostHog Analytics]
    end

    Browser --> NextJS
    SW --> PushAPI
    NextJS --> Express
    Express --> AuthService
    Express --> SimEngine
    Express --> ScoreEngine
    Express --> NotifService
    SimEngine --> EventEngine
    SimEngine --> Redis
    NotifService --> PushAPI
    NotifService --> EmailSvc
    AuthService --> PG
    SimEngine --> PG
    ScoreEngine --> PG
    Express --> Analytics
    Redis --> SimEngine
```

---

## 2. Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Next.js Frontend** | SSR pages, quiz UI, simulation dashboard, results display |
| **Express API** | REST endpoints, request validation, routing |
| **Auth Service** | Registration, login, JWT management, OAuth |
| **Simulation Engine** | Creates/manages simulation state, schedules tasks, handles progression |
| **Event Generator** | Random unexpected event creation with timing logic |
| **Score Calculator** | Aggregates simulation data into weighted readiness score |
| **Notification Service** | Dispatches push notifications and email fallbacks |
| **PostgreSQL** | Persistent storage for all domain data |
| **Redis** | Task queue (Bull), session cache, rate limiting |

---

## 3. Data Flow Diagrams

### 3.1 User Registration & Assessment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Server
    participant Auth as Auth Service
    participant DB as PostgreSQL

    U->>FE: Click "Get Started"
    FE->>API: POST /auth/register {email, password}
    API->>Auth: Hash password, create user
    Auth->>DB: INSERT INTO users
    DB-->>Auth: user_id
    Auth-->>API: JWT token
    API-->>FE: 200 {token, user}
    FE-->>U: Redirect to Quiz

    U->>FE: Answer quiz questions
    FE->>FE: Store answers locally (progressive)
    U->>FE: Submit final answer
    FE->>API: POST /assessments {responses[]}
    API->>DB: INSERT INTO assessments
    DB-->>API: assessment_id
    API-->>FE: 200 {assessment_id, recommended_pets[]}
    FE-->>U: Show pet selection screen
```

### 3.2 Simulation Start Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Server
    participant Sim as Simulation Engine
    participant Q as Redis Queue
    participant DB as PostgreSQL

    U->>FE: Select pet type + confirm start
    FE->>API: POST /simulations {pet_type, size, assessment_id}
    API->>Sim: createSimulation(user, petType)
    Sim->>Sim: Generate task schedule (3-7 days)
    Sim->>DB: INSERT INTO simulations
    Sim->>DB: INSERT INTO tasks (batch)
    Sim->>Q: Schedule all task notifications
    Q-->>Sim: Jobs queued
    Sim-->>API: {simulation_id, first_task}
    API-->>FE: 200 {simulation, schedule}
    FE-->>U: Show simulation dashboard + first task
```

### 3.3 Task Notification & Completion Flow

```mermaid
sequenceDiagram
    participant Q as Redis Queue
    participant Notif as Notification Service
    participant Push as Web Push API
    participant Email as Resend Email
    participant U as User
    participant FE as Frontend
    participant API as API Server
    participant DB as PostgreSQL

    Q->>Notif: Task due (job fires at scheduled_at)
    Notif->>Push: Send push notification
    Push-->>U: "🐕 Time to feed your dog!"

    alt User responds within 30 min
        U->>FE: Click notification → complete task
        FE->>API: PATCH /tasks/{id} {completed: true}
        API->>DB: UPDATE tasks SET completed_at = NOW()
        API-->>FE: 200 {score_impact, next_task}
        FE-->>U: "Great! Task completed in 4 min"
    else User doesn't respond in 30 min
        Q->>Notif: Fallback trigger
        Notif->>Email: Send email reminder
        Email-->>U: Email: "Your pet is waiting..."
    else User never responds
        Q->>DB: UPDATE tasks SET missed = true
        Note over DB: Missed task affects final score
    end
```

### 3.4 Unexpected Event Flow

```mermaid
sequenceDiagram
    participant Q as Redis Queue
    participant Evt as Event Generator
    participant DB as PostgreSQL
    participant Notif as Notification Service
    participant U as User
    participant FE as Frontend
    participant API as API Server

    Q->>Evt: Random event trigger (pre-scheduled)
    Evt->>Evt: Select event type based on pet + user profile
    Evt->>DB: INSERT INTO events {type, scenario, options[]}
    Evt->>Notif: Send urgent notification
    Notif-->>U: "⚠️ Emergency: Your cat is limping!"

    U->>FE: Open event screen
    FE->>API: GET /events/{id}
    API-->>FE: {scenario, options[], time_pressure}
    FE-->>U: Display scenario + choices

    U->>FE: Select response option
    FE->>API: POST /events/{id}/respond {choice, response_time}
    API->>DB: UPDATE events SET response = choice
    API->>DB: UPDATE simulations SET total_expenses += cost
    API-->>FE: {score_impact, explanation, actual_cost}
    FE-->>U: "Good choice! Here's what a vet would advise..."
```

### 3.5 Score Calculation Flow

```mermaid
sequenceDiagram
    participant Sim as Simulation Engine
    participant Score as Score Calculator
    participant DB as PostgreSQL
    participant API as API Server
    participant FE as Frontend
    participant U as User

    Note over Sim: Simulation day 3/7 complete (all tasks done or expired)
    Sim->>Score: calculateScore(simulation_id)
    
    Score->>DB: SELECT all tasks for simulation
    Score->>DB: SELECT all events for simulation
    Score->>DB: SELECT assessment for user
    
    Score->>Score: Calculate time_score (25%)
    Note over Score: completion_rate × response_speed × consistency
    
    Score->>Score: Calculate financial_score (20%)
    Note over Score: budget_vs_actual × emergency_response
    
    Score->>Score: Calculate living_score (15%)
    Note over Score: From assessment: space + yard + restrictions
    
    Score->>Score: Calculate flexibility_score (15%)
    Note over Score: Unscheduled event response times
    
    Score->>Score: Calculate experience_score (10%)
    Note over Score: From assessment: prior ownership + knowledge
    
    Score->>Score: Calculate emotional_score (10%)
    Note over Score: Stress scenario responses + commitment indicators
    
    Score->>Score: Calculate household_score (5%)
    Note over Score: From assessment: existing pets + family
    
    Score->>Score: Weighted sum → final score (0-100)
    Score->>Score: Generate recommendations based on gaps
    
    Score->>DB: INSERT INTO results {scores, recommendations}
    Score-->>API: {result_id, scores}
    API-->>FE: Redirect to results page
    FE-->>U: Display full readiness report
```

### 3.6 Notification Scheduling Flow

```mermaid
flowchart TD
    A[Simulation Created] --> B[Generate Task Schedule]
    B --> C{User Timezone & Work Hours}
    C --> D[Map tasks to appropriate times]
    D --> E[Morning Tasks: 6-8am local]
    D --> F[Midday Tasks: 11am-1pm local]
    D --> G[Evening Tasks: 5-8pm local]
    D --> H[Random Events: Any waking hour]
    
    E --> I[Queue in Redis with delay]
    F --> I
    G --> I
    H --> I
    
    I --> J{Task Due Time Reached}
    J --> K[Send Push Notification]
    K --> L{Acknowledged?}
    L -->|Yes, < 30min| M[Record completion time]
    L -->|No, > 30min| N[Send Email Fallback]
    N --> O{Responded to email?}
    O -->|Yes| M
    O -->|No, > 2hr| P[Mark as Missed]
    
    M --> Q[Update task in DB]
    P --> Q
    Q --> R[Recalculate running score]
```

---

## 4. Technology Stack Decisions

| Layer | Choice | Alternatives Considered | Why This |
|-------|--------|------------------------|----------|
| Frontend | Next.js 14 | Remix, SvelteKit | Best SSR + React ecosystem |
| Styling | Tailwind CSS | Chakra UI, MUI | Speed, no JS overhead |
| Backend | Express.js | Fastify, Nest.js | Simple, well-known, fast MVP |
| Database | PostgreSQL | MongoDB, MySQL | Relational data, JSONB for flexibility |
| Queue | Bull (Redis) | BullMQ, RabbitMQ | Simple, proven for scheduled jobs |
| Cache | Redis | Memcached | Also serves as queue backend |
| Auth | NextAuth.js | Auth0, Firebase Auth | Free, extensible, self-hosted |
| Push | web-push (npm) | Firebase FCM | Standards-based, no vendor lock |
| Email | Resend | SendGrid, SES | Modern DX, good free tier |
| Hosting | Vercel + Railway | AWS, Render | Fast deploys, affordable MVP |
| Analytics | PostHog | Mixpanel, Amplitude | Open-source, self-hostable |
| Monitoring | Sentry | Datadog, New Relic | Free tier, great error tracking |

---

## 5. Deployment Architecture

```mermaid
graph LR
    subgraph Vercel["Vercel (Frontend)"]
        Next[Next.js App]
        Edge[Edge Functions]
    end

    subgraph Railway["Railway (Backend)"]
        API[Express API]
        Worker[Bull Worker Process]
    end

    subgraph Managed["Managed Services"]
        PG[(PostgreSQL - Railway)]
        Redis[(Redis - Railway)]
    end

    subgraph CDN["CDN & Static"]
        Assets[Static Assets]
        SW[Service Worker]
    end

    User --> CDN
    User --> Vercel
    Next --> API
    API --> PG
    API --> Redis
    Worker --> Redis
    Worker --> PG
```
