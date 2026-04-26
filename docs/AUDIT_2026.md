# LaundryLobby Project Audit — 2026

Comprehensive bug, security, performance, and architecture audit across all 6 projects in the workspace. Updated with Sprint 1-3 fixes.

**Last updated:** 2026-04 — initial audit + Sprints 1-3 fixes
**Maintainer:** track new findings under "Discovered later" at the bottom

---

## Severity legend

- 🔥 **CRITICAL** — security or correctness; ship fix ASAP
- 🚨 **HIGH** — major architectural / UX issue; plan into a sprint
- ⚠️ **MEDIUM** — code quality / dev experience
- 🟢 **LOW** — polish / nice-to-have

## Status legend

- ✅ Fixed (in current branches; may not yet be on `main`/deployed)
- 🟡 Partially fixed
- 🔴 Not yet fixed

---

## 🔥 CRITICAL — Security and correctness

| # | Issue | Where | Status | Notes |
|---|---|---|---|---|
| 1 | CORS bypass — early `callback(null, true)` makes allowedOrigins logic dead code | `backend/src/app.js:181-186` (pre-fix) | ✅ Sprint 1 | Single `cors()` middleware; allowlist active in prod |
| 2 | `Access-Control-Allow-Origin: *` with `Allow-Credentials: true` — browsers reject | `backend/src/app.js:123, 229, 268` (pre-fix) | ✅ Sprint 1 | Two manual CORS layers removed; only `cors()` remains |
| 3 | localStorage holds the actual auth token (Bearer header from Zustand persist), XSS-readable | `frontend/src/lib/api.ts:21-43` | 🔴 | Cookie infra ready (Sprint 1); frontend cleanup needs api.laundrylobby.com (#6) live first |
| 4 | HttpOnly cookies broken cross-site (`SameSite=Strict` + no `domain` + backend on different eTLD+1) | `backend/src/utils/cookieConfig.js` | 🟡 Sprint 1 | sameSite→lax; `domain` opt-in via `COOKIE_DOMAIN` env. Inert until #6 live |
| 5 | `typescript.ignoreBuildErrors: true` — 364 type errors silenced in CI | `frontend/next.config.js:9` | 🔴 | Defer until type cleanup sprint |
| 5b | Rate limiting commented out as "temporary debugging" | `backend/src/app.js:257-260` | 🔴 | Adjacent to security; not in Sprint 1 |

---

## 🚨 HIGH — Architecture / UX

| # | Issue | Status | Notes |
|---|---|---|---|
| 6 | Backend on `laundrylobbybackend.vercel.app` (different eTLD+1 from `*.laundrylobby.com`) | 🔴 | Runbook documented in `backend/docs/API_DOMAIN_SETUP.md`; user does Vercel + DNS |
| 7 | 6 different API client implementations (`lib/api.ts`, `lib/adminApi.ts`, `lib/superAdminApi.ts`, `lib/centerAdminApi.ts`, `lib/tenantApi.ts`, `services/api.ts`) | 🟡 | `lib/api.ts` marked canonical; 2/47 hooks migrated (`useAdminDashboard`, `useAdminOrders`); playbook in `docs/REACT_QUERY_MIGRATION.md` |
| 8 | 47 custom data hooks NOT using React Query (despite QueryClient being configured) | 🟡 | 2/47 done. Sprint 4 continues with `useDashboardData` (9 hooks) + `useNotifications` |
| 9 | `/customer/*` and `/[tenant]/*` duplicate routes (10 segments mirrored) | 🟡 | Plan written: `docs/CUSTOMER_ROUTE_CONSOLIDATION.md` (4 phases, 2-3 dev days) |
| 10 | 8 permission-debug components shipped in production | ✅ Sprint 2 | Audited as orphan dead code (zero external imports); deleted |
| 11 | Sequential dashboard waterfall — auth → theme → render → data fetch | 🟡 | Loader is now signal-driven (still sequential at the data layer) |
| 12 | All 11 role dashboards eagerly imported | ✅ Sprint 2 | Lazy-loaded via `next/dynamic` in `RoleBasedDashboard.tsx` |
| 13 | Heavy libs (recharts, jsbarcode, qrcode, socket.io-client) eagerly loaded | 🟡 Sprint 2 | App Router per-route + dashboard `dynamic()` already split most of it. Per-component lazy-load deferred (not measurably needed) |
| 14 | Vercel cold start 2-5s | ✅ Sprint 2 | Firebase pubsub warmer added (every 4 min hits `/api/health`) |
| 15 | Hardcoded `laundrylobby.com` in 7 places — no `NEXT_PUBLIC_ROOT_DOMAIN` | 🔴 | Defer; works as-is, ops complexity to add env |
| 16 | Tenant subdomain root showed wrong page (`prakash.laundrylobby.com/` rendered LandingPageSelector) | ✅ | Middleware now rewrites `/<path>` → `/<slug>/<path>` for non-reserved subdomains |
| 17 | Root `/` rendered fake-tenant template confusing visitors | ✅ | Replaced with `<FindYourLaundry />`; old template moved to `/preview-templates` |
| 18 | Multiple `<Toaster />` instances mounted causing duplicate toasts | ✅ | Single Toaster in `providers.tsx`; ModernToaster export deleted |
| 19 | Fake-timer progress loader disconnected from real load progress | ✅ | Refactored to signal-driven (4 stages: hydration / auth / theme / role-check) |

---

## ⚠️ MEDIUM — Code quality

| # | Issue | Status | Notes |
|---|---|---|---|
| 20 | `eslint.ignoreDuringBuilds: true` | 🔴 | Same problem class as #5 |
| 21 | Interceptor + component double-toast pattern | 🔴 | Architectural choice required: which layer owns error UX |
| 22 | WebSocket dedup workaround (`shownNotificationsRef`) suggests relay still double-delivers | 🔴 | Backend trace job |
| 23 | `useAdminDashboard` API called twice (sidebar + page) | ✅ | React Query dedup makes it 1 call |
| 24 | `TenantBranding` type duplicated in 3 places | 🔴 | Extract into `src/types/tenant.ts` |
| 25 | Reserved-route lists scattered across many places | 🟡 | 8 layout files consolidated into `src/constants/reservedRoutes.ts`; middleware/useSubdomain/auth still have separate lists |
| 26 | `page-backup.tsx` in `src/app/` — dead file | ✅ Sprint 2 | Deleted |
| 27 | `AdminSidebar.tsx` duplicate `APP_VERSION` import | 🔴 | Pre-existing TS2300 error |
| 28 | `CenterAdminSidebar`/`EnhancedAdminSidebar`/`SuperAdminSidebar` have type errors | 🔴 | Pre-existing |
| 29 | Type drift across Branch / ChatSession / AddOn / BlogPost | 🔴 | Type unification needed |
| 30 | No request batching — dashboard fires 3-5 separate API calls | 🔴 | Backend should expose `/admin/dashboard/bootstrap` returning everything |
| 31 | No edge caching for `/api/public/tenancy/branding/*` | 🔴 | Add `Cache-Control: s-maxage=300, stale-while-revalidate=86400` |
| 32 | sessionStorage tenant branding cache never invalidated on update | 🟡 | Read-side works (TemplateHeader fallback); write-invalidate missing |
| 33 | Marketing project named `laundrylobbyy` (typo, 2 y's) | 🔴 | Rename in Vercel; alias keeps URL |
| 34 | Tenant `customDomain` field exists but middleware doesn't handle it | 🔴 | If tenant uses custom domain, middleware can't detect tenant context |
| 35 | `NEXT_PUBLIC_DEFAULT_TENANT` env var purpose unclear | 🔴 | Document or remove |
| 36 | Duplicate tenant detectors (`useTenant.js` deleted; `useSubdomain.ts` still has separate reserved list) | 🟡 | Partial — one detector remaining |
| 37 | Tenant `[tenant]/layout.tsx` is `'use client'` — first paint shows spinner | 🔴 | Server-component refactor for instant themed first paint |
| 38 | Frontend `.env.local` has `laundrylobby-backend-1.vercel.app`; actual prod uses `laundrylobbybackend.vercel.app` | 🔴 | Sync env files |

---

## 🟢 LOW — Polish / dev productivity

| # | Issue | Status | Notes |
|---|---|---|---|
| 39 | No monorepo tooling — 6 separate `package.json`, 6 `node_modules` (~5GB disk) | 🔴 | pnpm workspace migration |
| 40 | No shared types package — frontend, superadmin, marketing each redefine API shapes | 🔴 | Extract `@laundrylobby/types` |
| 41 | No top-level README explaining 6-project layout | 🔴 | Add `README.md` at workspace root |
| 42 | No `docker-compose.yml` for local dev | 🔴 | One command to spin up all 6 services |
| 43 | Inner `LaundryLobby/` folder confusingly named (it's the marketing site) | 🔴 | Rename to `marketing/` |
| 44 | No automated frontend tests (Jest config missing) | 🔴 | Superadmin has Jest config; main frontend doesn't |
| 45 | No API contract validation — backend Joi vs frontend Zod drift silently | 🔴 | Codegen from a single source of truth (OpenAPI?) |
| 46 | `node-cron` still in backend deps after migration to Firebase Functions | 🔴 | Remove unused dep |
| 47 | No CSP headers — only X-Frame-Options + X-Content-Type-Options | 🔴 | Add CSP via `vercel.json` headers |
| 48 | `.env.local` files drift across 4 frontend projects | 🔴 | Single source of truth |
| 49 | CORS allowed-origins regex included `.laundry$` (broken — no TLD) | ✅ Sprint 1 | Removed in CORS cleanup |
| 50 | Multiple Toaster instances scattered | ✅ | See #18 |
| 51 | Dead root `middleware.js` shadowed by `src/middleware.ts` | ✅ | Deleted; auth-register redirect ported into the active middleware |
| 52 | Dead `useTenant.js` hook (zero imports) | ✅ | Deleted |
| 53 | 13 production `console.log`s in dashboard components | 🔴 | Strip via build step |

---

## Security summary (subset)

- 🔥 #1 CORS bypass → ✅ Sprint 1
- 🔥 #2 `*` origin + credentials → ✅ Sprint 1
- 🔥 #3 localStorage auth token → 🔴 (Frontend cleanup deferred until #6 live)
- 🚨 #4 Cookies don't actually flow cross-site → 🟡 Sprint 1
- 🚨 #5b Rate limiting bypassed → 🔴
- ⚠️ #47 No CSP → 🔴
- ⚠️ #53 Production console.logs may leak → 🔴

---

## Sprint progress

### Sprint 1 — Stop the bleeding (security)
- ✅ #1, #2 CORS — single middleware, allowlist active
- ✅ #4 Cookie config — `sameSite: 'lax'`, opt-in `domain` via `COOKIE_DOMAIN`
- 📄 `backend/docs/API_DOMAIN_SETUP.md` — runbook for #6 (manual Vercel + DNS work)
- ⏭️ #3, #5 deferred

### Sprint 2 — Bundle / perf
- ✅ #10 Debug components deleted (9 dead files)
- ✅ #12 Dashboards lazy-loaded via `dynamic()`
- ✅ #14 Firebase warmer (every 4 min)
- ✅ #26 Page backup deleted
- 🟡 #13 Heavy libs — relied on App Router auto-split

### Sprint 3 — Architecture cleanup
- ✅ #7 `useAdminOrders` migrated to React Query (2/47)
- 📄 `frontend/docs/CUSTOMER_ROUTE_CONSOLIDATION.md` — #9 plan (4 phases)

### Sprint 4 — React Query rollout (in progress)
- ⏳ `useDashboardData.tsx` (9 role hooks)
- ⏳ `useNotifications.ts`
- (Then 35 more hooks across batches per playbook)

### Backlog
- #3, #5, #5b — security cleanup
- #15, #20–22, #24, #27–38 — architecture / quality
- #39–48 — polish

---

## Discovered later

(Add new findings here as you encounter them.)

| Date | Finding | Severity | Status |
|---|---|---|---|
| | | | |
