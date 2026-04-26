# Customer Route Consolidation Plan (Audit #9)

## Problem

We currently have **two parallel customer-facing route trees** that do mostly the same thing:

```
src/app/customer/        ← global customer app, reads tenant from cookie
src/app/[tenant]/        ← tenant-scoped customer app, reads tenant from URL
```

Most pages exist in BOTH. A customer visiting `/customer/orders` and the same customer visiting `/prakash/orders` end up on near-identical screens with the same data, but maintained as two separate codebases.

## Current state — what's where

| Route segment | `/customer/*` | `/[tenant]/*` |
|---|---|---|
| `addresses` | ✅ | ✅ |
| `dashboard` | ✅ | ✅ |
| `loyalty` | ✅ | ✅ |
| `offers` | ✅ | ✅ |
| `orders` | ✅ | ✅ |
| `profile` | ✅ | ✅ |
| `referrals` | ✅ | ✅ |
| `reviews` | ✅ | ✅ |
| `support` | ✅ | ✅ |
| `wallet` | ✅ | ✅ |
| **Total duplicated** | **10** | **10** |
| `notifications` | ✅ | ❌ unique to `/customer` |
| `upgrade`, `upgrade-status` | ✅ | ❌ unique to `/customer` |
| `auth`, `help`, `pricing`, `services` | ❌ | ✅ unique to `/[tenant]` |
| `all-reviews`, `[...slug]`, `page.tsx` (landing) | ❌ | ✅ unique to `/[tenant]` |

## Why they exist in parallel — historical context

`/[tenant]/*` is the newer, intentional architecture: tenant slug in URL, branding fetched in layout, fully scoped. `/customer/*` is the older approach: tenant context inferred from `tenant-slug` cookie set by middleware.

Both work today because of middleware fallbacks. The cost is **silent drift** — bugs fixed in one tree are missed in the other; UI tweaks land in only one place.

## Target — `/[tenant]/*` as canonical

The natural canonical is `/[tenant]/*` because:
1. Tenant slug is in the URL, not in a fragile cookie
2. Aligns with our tenant-first master plan (subdomain rewrite already routes tenant subdomains to `/[tenant]/*`)
3. `params.tenant` is always available in components (no auth-store gymnastics)
4. SEO benefit — tenant pages get crawlable URLs
5. Survives logout (cookie-less browsing of tenant pages still works)

`/customer/*` will be **removed**, with the 3 unique pages (notifications, upgrade, upgrade-status) moved into `/[tenant]/*`.

## Migration phases

### Phase 1 — Move the unique pages (½ day)

Pages only in `/customer/*` need new homes:

| From | To |
|---|---|
| `app/customer/notifications/page.tsx` | `app/[tenant]/notifications/page.tsx` |
| `app/customer/upgrade/page.tsx` | `app/[tenant]/upgrade/page.tsx` |
| `app/customer/upgrade-status/page.tsx` | `app/[tenant]/upgrade-status/page.tsx` |

Implementation note: each page needs `useParams()` to read the tenant slug instead of reading from cookie. Mostly a search-and-replace.

### Phase 2 — Audit duplicates and pick winning version (1-2 days)

For each of the 10 duplicates, compare the two versions side-by-side:

```
diff app/customer/orders/page.tsx app/[tenant]/orders/page.tsx
```

Decide:
- If they're nearly identical → use `/[tenant]` version, delete `/customer` version
- If `/[tenant]` version is missing recent fixes → port the diff over
- If `/customer` is more polished → port THAT to `/[tenant]`, then delete `/customer`

**Rule:** by end of phase 2, every customer-facing page lives ONLY in `/[tenant]/*`.

Files to delete after audit:
- All 10 `app/customer/<segment>/page.tsx`
- `app/customer/layout.tsx`
- `app/customer/` directory entirely

### Phase 3 — Redirects in middleware (½ day)

Existing bookmarks pointing to `/customer/*` should not 404. Add to [src/middleware.ts](../src/middleware.ts), early in the function (before the reserved-route branch):

```ts
// Legacy /customer/* paths → /[tenant]/* using cookie or auth context.
// Eventually remove this redirect (target: 6 months after deploy).
if (firstSegment === 'customer' && pathSegments[1]) {
  const tenantCookie = request.cookies.get('tenant-slug')?.value
  if (tenantCookie) {
    const url = request.nextUrl.clone()
    url.pathname = `/${tenantCookie}/${pathSegments.slice(1).join('/')}`
    return NextResponse.redirect(url, 301)
  }
  // No tenant context → send to discovery
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.redirect(url, 301)
}
```

Add `'customer'` to `RESERVED_ROUTES` (it already is — line 11 of middleware.ts ✅) so the redirect catches before tenant detection runs.

### Phase 4 — Remove `customer` from reserved routes once redirects are stable (after 6 months)

Once 301 redirects have been live long enough that no live traffic hits `/customer/*`, remove the redirect block from middleware. The route segment can be reclaimed (e.g., a tenant could be named `customer` if desired — currently impossible because reserved).

If you don't care about that, keep `customer` reserved forever.

## Sidebar/link updates needed

After Phase 2, every `<Link>` and `router.push` in the codebase pointing at `/customer/*` becomes broken. Audit:

```bash
grep -rn "'/customer/" src/  # find all hardcoded /customer references
grep -rn '"/customer/' src/  # double-quote variant
grep -rn "router.push.*customer" src/
```

Replace with tenant-aware versions:

```tsx
// Before
<Link href="/customer/orders">Orders</Link>

// After
const params = useParams()
<Link href={`/${params?.tenant}/orders`}>Orders</Link>
```

Or use a centralized helper:

```tsx
// src/lib/customerRoutes.ts (new)
export function customerRoute(tenant: string, segment: string) {
  return `/${tenant}/${segment}`
}
```

Counts to expect (rough):
- `CustomerSidebar.tsx`, `CustomerHeader.tsx` — primary navigation
- `app/[tenant]/layout.tsx` — wrappers
- Lots of inline `<Link>`s scattered

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Production users have `/customer/*` bookmarked | High | 301 redirects in middleware (Phase 3) |
| Diff between two versions has fixes only in one | High | Phase 2 manual comparison is essential — don't blind-delete |
| Sidebar nav silently breaks after page deletion | Medium | Phase 2 test plan: navigate to every customer page and verify |
| Login redirect logic targets `/customer/*` somewhere | Medium | Grep for hardcoded redirects in auth controllers and login pages |
| Email links / external integrations point to `/customer/*` | Low | Redirects handle it; communicate change to integrations team |

## What this is NOT

- This is **not** about `/admin/*` → `/[tenant]/admin/*` migration. That's a separate, larger project (Phase 3 of the master plan, ~4 weeks).
- This is **not** an architectural rewrite — it's deduplication of existing code that already works.
- This does **not** affect the SuperAdmin app (separate Next.js project on `superadmin.laundrylobby.com`).

## Estimated total effort

- Phase 1 (move uniques): ½ day
- Phase 2 (diff + dedup 10 routes): 1-2 days
- Phase 3 (redirects): ½ day
- Phase 4 (cleanup, 6 months later): ½ day

**Total: 2-3 dev days** spread across ~6 months for safe rollout.

## Recommended sequencing

1. Do Phase 1 + 3 in one PR — ship the redirect first so future-prod tolerates the missing routes
2. Phase 2 in 2-3 small PRs (group by feature: orders, addresses, etc.) so diffs stay reviewable
3. Phase 4 later

## Decision needed before starting

- **Does the admin team need any of the `/customer/*` pages for support/impersonation flows?** If admins navigate to a customer page to debug, those URLs need to keep working until impersonation moves to `/[tenant]/*` URLs too.
- **Are there any external integrations** (email links, SMS deep-links, partner referrals) that hardcode `/customer/*` URLs? They'll need a heads-up.

Once those are answered, Phase 1 can begin.
