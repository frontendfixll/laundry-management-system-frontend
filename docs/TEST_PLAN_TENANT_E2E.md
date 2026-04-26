# Tenant End-to-End Test Plan (Plan A)

Verifies the full multi-tenant flow with a real backend running locally.

## Prerequisites

- Backend running: `cd laundry-management-system-backend && npm run dev` (port 5000)
- MongoDB connected (Atlas or local)
- Frontend running: `cd laundry-management-system-frontend && npm run dev` (port 3005)
- A unique test slug, e.g. `testlaundry01`

---

## Step 1 — Backend health check

```powershell
curl http://localhost:5000/api/health
```

**Expect:**
```json
{
  "success": true,
  "message": "Laundry Management API is running",
  "env_check": { "mongodb_uri": true, "jwt_secret": true, ... }
}
```

❌ If `mongodb_uri: false` → set `MONGODB_URI` env in backend `.env`
❌ If 404/connection refused → backend not running

---

## Step 2 — Check subdomain availability

```powershell
curl http://localhost:5000/api/public/tenancy/check-subdomain/testlaundry01
```

**Expect:** `{"success": true, "data": { "available": true }}`

If `available: false`, pick a different slug.

---

## Step 3 — Initiate tenant signup (no payment, draft state)

```powershell
$body = @'
{
  "tenancyName": "Test Laundry",
  "businessName": "Test Laundry Pvt Ltd",
  "subdomain": "testlaundry01",
  "plan": "basic",
  "adminName": "Test Admin",
  "adminEmail": "testadmin01@example.com",
  "adminPhone": "9999999999",
  "adminPassword": "TestPass123!",
  "address": {
    "street": "123 Test St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "IN"
  }
}
'@

curl -X POST http://localhost:5000/api/public/signup/initiate `
  -H "Content-Type: application/json" `
  -d $body
```

**Expect:** Either
- A `checkoutUrl` (Stripe checkout link — see Plan E for payment), OR
- `{ tenancy: {...}, admin: {...} }` if signup is configured to skip Stripe in dev

❌ If 400 with "subdomain already exists" → pick different slug (Step 2 should have caught this)
❌ If 500 with email error → likely Brevo/SMTP env missing; non-fatal for testing

---

## Step 4 — Verify tenant in DB via branding endpoint

```powershell
curl http://localhost:5000/api/public/tenancy/branding/testlaundry01
```

**Expect:** JSON with `name`, `slug`, `subdomain`, `branding`, `branches: []`, `tenancyId`

❌ 404 → signup didn't create tenant. Check backend logs.

---

## Step 5 — Login as the tenant admin

```powershell
$loginBody = @'
{ "email": "testadmin01@example.com", "password": "TestPass123!" }
'@

curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $loginBody
```

**Expect:** `{ token: "...", user: { role: "admin" or "tenant_owner", tenancy: {...} } }`

Save the `token` — you'll use it in Step 8.

---

## Step 6 — Tenant landing renders (browser)

Open: `http://localhost:3005/testlaundry01`

**Expect:**
- Default template (Original) loads with **"Test Laundry"** as business name
- Page does NOT show "Laundry not found"
- DevTools Network: a request to `/api/public/tenancy/branding/testlaundry01` returns 200

❌ If "Laundry not found" → tenant exists but `status` field is not `active`. Check DB.

---

## Step 7 — Find Your Laundry search

Open: `http://localhost:3005/`

Type "Test" in the search bar. **Expect:** "Test Laundry" appears in results within ~300ms.

❌ If it doesn't appear → backend `/list?q=Test` may not be returning it. Check tenant `status`.

---

## Step 8 — Admin panel scoped to tenant

Open: `http://localhost:3005/admin/dashboard`

(Login flow may redirect via `/auth/login` — use credentials from Step 3.)

**Expect:** Admin dashboard renders. URL stays `/admin/dashboard`. Cookie `tenant-slug=testlaundry01` set.

---

## Step 9 — Cross-tenant isolation check (optional, IMPORTANT)

If you have a SECOND test tenant (e.g. from a previous run), try this:

1. Login as `testadmin01`
2. Note the order ID of an order belonging to a DIFFERENT tenant (you'll need to query DB or have prior data)
3. Try to assign it to your branch:
   ```powershell
   curl -X PUT http://localhost:5000/api/admin/orders/<OTHER_TENANT_ORDER_ID>/assign-branch `
     -H "Authorization: Bearer <YOUR_TOKEN>" `
     -H "Content-Type: application/json" `
     -d '{"branchId":"<YOUR_BRANCH_ID>"}'
   ```

**Expected (after security fix):** 404 "Order not found"
**Actual TODAY (audit finding):** Likely **succeeds** — this is the cross-tenant isolation bug from Sprint 8 audit. Document if confirmed.

---

## Step 10 — Cleanup

```powershell
# Optional: drop the test tenant via DB or via a cleanup endpoint if exists
mongo $MONGODB_URI --eval 'db.tenancies.deleteOne({ slug: "testlaundry01" })'
```

---

## Pass/fail checklist

- [ ] Step 1: Backend health OK
- [ ] Step 2: Subdomain available
- [ ] Step 3: Signup initiated (no error)
- [ ] Step 4: Branding fetch returns tenant
- [ ] Step 5: Login returns token
- [ ] Step 6: Tenant landing page renders with branding
- [ ] Step 7: Search finds tenant
- [ ] Step 8: Admin panel loads
- [ ] Step 9: Cross-tenant access **rejected** (currently expected to FAIL — audit issue)
- [ ] Step 10: Cleaned up

If all 1-8 pass and 9 demonstrates the leak: multi-tenant infra works correctly EXCEPT the isolation gap in adminController.js.
