# React Query Migration Guide

This guide walks the team through converting our manual `useState` + `useEffect` data hooks to **React Query** (`@tanstack/react-query`), as part of the Phase 1 performance foundation.

The infrastructure is already in place — `QueryClientProvider` is mounted in [src/components/providers.tsx](../src/components/providers.tsx) with `staleTime: 60s` defaults. We just need to actually use it.

---

## Why we are doing this

Today every custom data hook (47+ of them) does:

```ts
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
useEffect(() => { fetch(...).then(setData).finally(() => setLoading(false)) }, [])
```

Consequences:
- **No cache.** Every page revisit re-fetches the same endpoint.
- **No deduplication.** Two components calling the same endpoint = two network requests.
- **No retry strategy.** A flaky 503 just shows an error.
- **No background refresh.** Stale data stays stale until manual refresh.
- **No request cancellation.** Slow requests pile up.

React Query gives us all of this for free. Same endpoint, fewer roundtrips, faster perceived load.

---

## The pattern

### 1. Pick the canonical API client

Use [`src/lib/api.ts`](../src/lib/api.ts). It is the axios instance with auth interceptors, 401 logout, and error toasts already wired. Do **not** use:

- `lib/adminApi.ts` (manual fetch, localStorage token reading)
- `lib/superAdminApi.ts`
- `lib/centerAdminApi.ts`
- `lib/tenantApi.ts`
- `services/api.ts`

These are being migrated to `lib/api.ts`. New code must not add to them.

### 2. Convert a hook

**Before** ([example: `useAdmin.ts:useAdminDashboard` before migration](../src/hooks/useAdmin.ts)):

```ts
export function useAdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getDashboard()
      setMetrics(response.data.metrics)
      setRecentOrders(response.data.recentOrders)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  return { metrics, recentOrders, loading, error, refetch: fetchDashboard }
}
```

**After** (the migrated version, [`useAdmin.ts:useAdminDashboard`](../src/hooks/useAdmin.ts)):

```ts
export function useAdminDashboard() {
  const query = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/dashboard')
        return {
          metrics: response.data.data?.metrics ?? null,
          recentOrders: response.data.data?.recentOrders ?? [],
        }
      } catch (err: any) {
        if (err?.response?.status === 403) return { metrics: null, recentOrders: [] }
        throw err
      }
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, err: any) => {
      const status = err?.response?.status
      if (status >= 400 && status < 500) return false
      return failureCount < 2
    },
  })

  return {
    metrics: query.data?.metrics ?? null,
    recentOrders: query.data?.recentOrders ?? [],
    loading: query.isPending,
    error: query.error ? (query.error.message ?? 'Failed to fetch') : null,
    refetch: query.refetch,
  }
}
```

**Notice:** the return shape is unchanged so callers don't need to update. This is the rule — preserve the public contract.

---

## Rules for queryKey

Query keys are the cache identity. Get them right or cache breaks.

```ts
// ✅ Hierarchical, plain values
queryKey: ['admin', 'dashboard']
queryKey: ['admin', 'orders', { page, limit, status }]
queryKey: ['customer', 'orders', orderId]
queryKey: ['tenant', tenantSlug, 'branding']

// ❌ Don't do this
queryKey: ['adminDashboard']                      // not hierarchical
queryKey: [`/admin/orders?page=${page}`]          // strings hide structure
queryKey: ['admin', 'orders', filters]            // object with non-stable refs
```

**Convention:**
1. First segment = **role/scope** (`admin`, `customer`, `tenant`, `superadmin`)
2. Second segment = **resource** (`dashboard`, `orders`, `branches`)
3. Third+ = **id or filters** (a single id, or a plain-object of filters)

This lets us invalidate broadly (`['admin']`) or narrowly (`['admin', 'orders', { page: 2 }]`).

---

## Rules for staleTime / gcTime

| Data type | staleTime | Notes |
|---|---|---|
| Static reference data (branches, services list) | `5 * 60_000` (5 min) | Rarely changes |
| User profile, tenant branding | `60_000` (1 min) | Default |
| Dashboard metrics | `60_000` | Default |
| Live counts (active orders, notifications) | `15_000` | Refresh more often |
| Mutation-tied data (e.g., order list after create) | `60_000` + invalidate on mutation |

`gcTime` (garbage collection) — leave at React Query default (5 min) unless data is huge.

---

## Mutations

Convert `async function update(...)` patterns to `useMutation`:

```ts
// Before
const handleAssign = async (orderId: string, branchId: string) => {
  setSubmitting(true)
  try {
    await adminApi.assignToBranch(orderId, branchId)
    await refetchOrders()
    toast.success('Assigned')
  } catch (err) {
    toast.error(err.message)
  } finally {
    setSubmitting(false)
  }
}

// After
const queryClient = useQueryClient()
const assignMutation = useMutation({
  mutationFn: ({ orderId, branchId }: { orderId: string; branchId: string }) =>
    api.patch(`/admin/orders/${orderId}/assign-branch`, { branchId }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    toast.success('Assigned')
  },
  onError: (err: any) => toast.error(err.message ?? 'Failed'),
})

// In JSX:
<button
  onClick={() => assignMutation.mutate({ orderId, branchId })}
  disabled={assignMutation.isPending}
>
  Assign
</button>
```

---

## When to use `enabled`

If a query depends on data that may not be ready (e.g., user must be logged in, or an id is required), gate it:

```ts
useQuery({
  queryKey: ['customer', 'orders', userId],
  queryFn: () => api.get(`/customer/orders?userId=${userId}`),
  enabled: !!userId,   // don't fire until userId exists
})
```

---

## Prefetching

When you know the user is about to navigate, prefetch:

```ts
// On hover / on login success / in a parent route layout
const queryClient = useQueryClient()
queryClient.prefetchQuery({
  queryKey: ['admin', 'dashboard'],
  queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  staleTime: 60_000,
})
```

The cache fills in the background; the destination route renders instantly.

---

## Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| Data refetches on every focus | React Query default (`refetchOnWindowFocus: true`) | Usually desired. Set `false` per-query if not. |
| 401 logout fires twice | Component remounted, both fired | The interceptor in `lib/api.ts` already gates on `authStore.token` — should be safe. |
| Cache never invalidates after mutation | Forgot `queryClient.invalidateQueries` | Always invalidate the affected key in `onSuccess`. |
| Two hooks fetch same endpoint twice | Different queryKeys | Standardize the key. Use the conventions above. |
| `queryFn` runs but UI shows stale data | `setQueryData` was used but didn't match the key | Match the key exactly. |
| `query.error` is `Error` but original was `string` | React Query types | Use `query.error?.message ?? null` to preserve old contract. |

---

## Migration priority order

Migrate hooks in this order. Each batch should be its own PR.

### Batch 1 — Highest-traffic, biggest UX wins (Week 1-2)
- `useAdminDashboard` ✅ done (pilot)
- `useAdminOrders` ✅ done (Sprint 3)
- `useDashboardData.tsx` 9 role hooks ✅ done (Sprint 4) — `useApiData` generic + `useAnalytics` deferred (need stable per-call queryKeys, deeper refactor)
- ~~`useNotifications`~~ — **do not migrate** (see below)

### Batch 2 — Customer-facing (Week 3)
- `useOrders` ✅ done (Sprint 5)
- `useAddresses` ✅ done (Sprint 5)
- `useWallet` ✅ done (Sprint 6) — 3 hooks (balance, transactions, addMoney); switched from raw fetch+token to canonical `lib/api.ts`
- `useLoyalty` 🟡 partial (Sprint 6) — 3 of 6 hooks migrated (Transactions, EnrollLoyalty, RedeemPoints). The 3 getter-pattern hooks (`useLoyaltyBalance`, `useAvailableRewards`, `useTierInfo`) need consumer refactor first — see "Getter-pattern hooks" below

### Batch 3 — Reference data (Week 4)
- `useBranding` ✅ done (Sprint 5)
- `useSettings` ✅ done (Sprint 6)
- `usePricing` ✅ done (Sprint 7) — 5 internal hooks (usePricing, useActivePricing, usePriceCalculation, useServiceItems, useDiscountPolicies); 5 mutations on the main one all invalidate the list
- `useFeatures` ⏭️ **skip** — pure derivation from `useAuthStore` state, no API calls. Already efficient via `useMemo`. Not a Query candidate.
- `useBranches` 🟡 **deferred** — uses imperative `fetchBranches(filters)` pattern where caller passes filters at call time. Conflicts with React Query's queryKey-known-upfront model. Migration needs careful consumer refactor (filters become hook arg) + dedicated PR with smoke testing on superadmin's branch management UI.

### Getter-pattern hooks (refactor needed BEFORE migrating)

`useLoyaltyBalance`, `useAvailableRewards`, `useTierInfo` expose a `getX()` function instead of a `data` field. Consumers call the getter imperatively to fetch data, so converting to React Query (which auto-fetches) breaks the contract.

The fix is to refactor consumers to read `data` directly:

```ts
// Before
const { getBalance, loading } = useLoyaltyBalance()
const result = await getBalance()
if (result.success) setBalance(result.data)

// After
const { data: balance, loading } = useLoyaltyBalance()
```

Once consumers no longer rely on the imperative getter, migrate the hook itself the same way as `useLoyaltyTransactions`.

### Batch 4 — Admin tooling (Week 5+)
- `useCoupons`, `useDiscounts`, `useCampaigns`, `useReferral`
- `useAdmin` (other endpoints), `useAdminTickets`, `useStaff`
- `useAnalytics`, `useFinancial`, `useAudit`, `useRisk`

### Do NOT migrate
- `useAuth` (auth flow, not data fetching)
- `useDebounce`, `useMediaQuery`, `useUnsavedChangesWarning` (not data hooks)
- `useSocketIONotifications`, `useNotificationsWebSocket`, **`useNotifications`** (event streams via Socket.IO — React Query is for request/response)
- `useApiData<T>` generic in `useDashboardData.tsx` — its design (no per-call queryKey) is incompatible with React Query's caching model. Replace each call site with a direct `useQuery({ queryKey: [...], queryFn: ... })` instead of trying to fix the generic.

---

## Verifying a migration

After converting a hook:

1. **Type-check passes** — `npx tsc --noEmit` (errors limited to file you touched should be zero)
2. **Manual smoke test** — load the page, navigate away, navigate back. Second visit should be instant (cache hit).
3. **DevTools** — install [@tanstack/react-query-devtools](https://tanstack.com/query/latest/docs/react/devtools) in dev only; verify your queryKey appears, has expected `staleTime`, and shows cached data.
4. **Network tab** — confirm only one request fires when two components on the same page consume the hook.
5. **Mutation flow** — if there are mutations, confirm they invalidate the right queries.

---

## Adding the React Query Devtools (dev only)

Recommended for the team during migration:

```bash
pnpm add -D @tanstack/react-query-devtools
```

Then in `src/components/providers.tsx`:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// inside the QueryClientProvider:
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

It shows every active query, cache age, refetch state, and lets you manually invalidate while debugging.

---

## Questions

- **Should I migrate a hook in the same PR as feature work?** No. Migrate in a dedicated PR per batch. Easier to review and revert.
- **What if the existing hook has weird behavior I want to preserve (like silent 403)?** Replicate it inside `queryFn` with try/catch (see `useAdminDashboard` for an example).
- **What if the API returns differently shaped data depending on inputs?** Use `select` to normalize, or branch in `queryFn`. Don't mutate `query.data` after the fact.

---

## Reference: completed pilot

See [src/hooks/useAdmin.ts](../src/hooks/useAdmin.ts) (`useAdminDashboard`) for the canonical example. Same return contract, dramatically better behavior.
