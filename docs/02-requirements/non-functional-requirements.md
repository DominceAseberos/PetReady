# Non-Functional Requirements

## Document Info
- **Phase**: Requirements
- **Author**: PetReady Team
- **Date**: 2026-06-24
- **Status**: Draft

---

## 1. Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time (initial) | < 2 seconds on 3G |
| NFR-002 | Time to Interactive (TTI) | < 3 seconds |
| NFR-003 | API response time (95th percentile) | < 300ms |
| NFR-004 | Push notification delivery latency | < 5 seconds |
| NFR-005 | Concurrent users supported | 1,000 (MVP), 10,000 (scale) |
| NFR-006 | Database query time (95th percentile) | < 100ms |

---

## 2. Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-010 | Horizontal scaling for API servers | Auto-scale at 70% CPU |
| NFR-011 | Database connection pooling | Up to 100 connections |
| NFR-012 | Task queue throughput | 10,000 scheduled tasks/hour |
| NFR-013 | Stateless API design | All state in DB/Redis |

---

## 3. Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-020 | Uptime SLA | 99.5% (MVP), 99.9% (scale) |
| NFR-021 | Scheduled maintenance window | Sundays 2–4am UTC |
| NFR-022 | Data backup frequency | Daily automated backups |
| NFR-023 | Recovery Point Objective (RPO) | < 24 hours |
| NFR-024 | Recovery Time Objective (RTO) | < 4 hours |
| NFR-025 | Graceful degradation | If push fails, email fallback within 30 min |

---

## 4. Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-030 | HTTPS enforced on all endpoints | TLS 1.3 |
| NFR-031 | Password hashing | bcrypt with cost factor 12 |
| NFR-032 | JWT token expiry | 1 hour access, 7 day refresh |
| NFR-033 | Rate limiting | 100 requests/min per user |
| NFR-034 | Input validation | All user inputs sanitized server-side |
| NFR-035 | SQL injection prevention | Parameterized queries only |
| NFR-036 | XSS prevention | Content Security Policy + output encoding |
| NFR-037 | CORS configuration | Whitelist production domains only |
| NFR-038 | Dependency vulnerability scanning | Weekly automated scan |

---

## 5. Privacy & Compliance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-040 | GDPR compliance | Right to access, delete, export |
| NFR-041 | CCPA compliance | "Do not sell my data" honored |
| NFR-042 | Cookie consent | Banner with granular opt-in |
| NFR-043 | Data minimization | Collect only what's needed for scoring |
| NFR-044 | Data retention policy | Delete inactive accounts after 2 years |
| NFR-045 | Privacy policy | Published, accessible, plain language |
| NFR-046 | Analytics opt-out | Users can disable tracking |

---

## 6. Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-050 | Mobile-responsive design | Works on 320px–2560px screens |
| NFR-051 | WCAG 2.1 AA compliance | All interactive elements accessible |
| NFR-052 | Keyboard navigation | Full app navigable without mouse |
| NFR-053 | Screen reader support | ARIA labels on all components |
| NFR-054 | Color contrast ratio | Minimum 4.5:1 for text |
| NFR-055 | Error messages | Human-readable, actionable guidance |
| NFR-056 | Onboarding completion | < 5 minutes from landing to first task |
| NFR-057 | Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 7. Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-060 | Code test coverage | > 80% for core simulation logic |
| NFR-061 | Documentation | All APIs documented with OpenAPI spec |
| NFR-062 | Linting & formatting | ESLint + Prettier, enforced in CI |
| NFR-063 | Dependency updates | Monthly review, automated PRs |
| NFR-064 | Logging | Structured JSON logs, centralized |
| NFR-065 | Error tracking | Automated error reporting (Sentry) |
| NFR-066 | Feature flags | New features behind toggles |

---

## 8. Deployment & Operations

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-070 | CI/CD pipeline | Automated test → build → deploy |
| NFR-071 | Zero-downtime deployments | Rolling deploys or blue-green |
| NFR-072 | Environment parity | Dev, staging, production configs |
| NFR-073 | Infrastructure as Code | All infra defined in config files |
| NFR-074 | Monitoring & alerting | CPU, memory, error rate, response time |
| NFR-075 | Health check endpoint | `/health` returns 200 with service status |

---

## 9. Internationalization (Future)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-080 | English (US) primary language | MVP |
| NFR-081 | i18n-ready architecture | String externalization from day 1 |
| NFR-082 | Timezone handling | All times stored UTC, displayed in user timezone |
| NFR-083 | Currency display | USD default, locale-aware formatting |
