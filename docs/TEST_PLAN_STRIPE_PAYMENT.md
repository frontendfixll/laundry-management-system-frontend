# Stripe Payment Flow Test Plan (Plan E)

Verifies the paid signup flow end-to-end: marketing site → Stripe checkout → webhook → tenant activated.

## Prerequisites

- Backend running on `localhost:5000`
- Marketing site running on `localhost:3007` (`cd LaundryLobby && npm run dev`)
- Stripe **test mode** keys in backend env (NOT live keys):
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...` (needed for local webhook signature verification)
- Stripe CLI installed (for local webhook forwarding): `https://stripe.com/docs/stripe-cli`

---

## Step 1 — Forward Stripe webhooks to localhost

In a separate terminal:

```powershell
stripe listen --forward-to http://localhost:5000/api/sales/upgrades/stripe-webhook
# OR for the signup webhook specifically (check backend routes for the actual path):
stripe listen --forward-to http://localhost:5000/api/public/signup/webhook
```

Stripe CLI will print a webhook signing secret like `whsec_abc123...`. **Copy this** and:
- Set `STRIPE_WEBHOOK_SECRET=whsec_abc123...` in backend `.env`
- Restart backend so it picks up the new secret

Keep this terminal running — every event Stripe sends will be forwarded here.

---

## Step 2 — Visit pricing page

Open: `http://localhost:3007/pricing`

**Expect:** Plan cards visible (Basic / Professional / Enterprise). Click "Get Started" on any plan.

---

## Step 3 — Fill signup form

URL: `http://localhost:3007/signup/[planId]`

Fill:
- Tenancy name: `Stripe Test Co`
- Business name: `Stripe Test Pvt Ltd`
- Subdomain: `stripetest01` (must be unique — check `/api/public/tenancy/check-subdomain/stripetest01` first)
- Admin name + email + phone + password

Click **"Continue to Payment"** or whatever the CTA is.

**Expect:** Redirect to Stripe Checkout (URL starts with `https://checkout.stripe.com/...`).

❌ If error before redirect → check backend logs. Most common: missing Stripe keys, or `subdomain already exists`.

---

## Step 4 — Pay with Stripe test card

On the Stripe Checkout page, use:

| Field | Value |
|---|---|
| Card | `4242 4242 4242 4242` (succeeds) |
| Expiry | Any future date (e.g. `12/28`) |
| CVC | Any 3 digits (e.g. `123`) |
| Name on card | Any |
| Billing email | Any |
| Country | India / IN |
| ZIP | Any |

Click **Pay**.

**Other test cards:**
- `4000 0000 0000 0002` — declined (test the failure path)
- `4000 0025 0000 3155` — requires 3D Secure (test the OTP modal)
- Full list: https://stripe.com/docs/testing#cards

---

## Step 5 — Watch the webhook arrive

In the `stripe listen` terminal you started in Step 1, you should see:

```
✓ checkout.session.completed
✓ payment_intent.succeeded
✓ customer.created
```

Each forwarded to `localhost:5000` and returning `200 OK`.

❌ If `4xx` or `5xx` → backend webhook handler errored. Check backend logs for the actual error.

---

## Step 6 — Browser redirected to success page

Stripe redirects you back to: `http://localhost:3007/success?session_id=cs_...`

**Expect:** "Payment successful" page with tenant info. Maybe a "Go to your dashboard" CTA pointing to `localhost:3005/<your-slug>` or similar.

---

## Step 7 — Verify tenant is now `active` in DB

```powershell
curl http://localhost:5000/api/public/tenancy/branding/stripetest01
```

**Expect:** Returns tenant data. Look for `status: "active"` (or whatever the post-payment status field is named — some implementations use `subscriptionStatus`).

❌ If still `status: "trial"` or `status: "draft"` → webhook didn't successfully activate. Check backend logs around the time of the webhook arrival.

---

## Step 8 — Login as the new admin

```powershell
$loginBody = @'
{ "email": "<email-from-step-3>", "password": "<password-from-step-3>" }
'@

curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $loginBody
```

**Expect:** `{ token, user: { role: "admin"/"tenant_owner", tenancy: { _id, slug } } }`

---

## Step 9 — Tenant landing with paid plan visible

Open: `http://localhost:3005/stripetest01`

**Expect:** Tenant landing renders. If you go to admin dashboard, the subscription card should show the plan you bought (Basic / Pro / Enterprise) and renewal date.

---

## Failure scenarios to test

### 9a — Card declined
Use `4000 0000 0000 0002`. After failed payment:
- Stripe shows error inline
- Browser stays on Checkout (no redirect to success)
- Tenant in DB stays in `draft`/`trial` state — NOT activated
- Verify: `curl /api/public/tenancy/branding/<slug>` returns the draft tenant (or 404 if signup auto-cleans)

### 9b — Webhook delayed
Stripe webhooks usually arrive within 5s, but can be delayed. Test by:
1. Pay successfully
2. Get redirected to success page IMMEDIATELY
3. Check tenant status — might be `draft` if webhook hasn't arrived yet
4. Wait 30s, check again — should be `active`

The success page should poll the tenancy status, not assume webhook already fired.

### 9c — Duplicate signup
Try signing up with the same `subdomain` twice (in two browser tabs). Expected: second one fails at Step 3 with "subdomain taken" error.

---

## Pass/fail checklist

- [ ] Step 1: Stripe CLI forwards webhooks
- [ ] Step 2-3: Signup form submits, redirects to Stripe Checkout
- [ ] Step 4: Test card 4242 succeeds
- [ ] Step 5: Webhooks arrive and 200 OK
- [ ] Step 6: Browser lands on success page
- [ ] Step 7: Tenant `status` flipped to `active` in DB
- [ ] Step 8: Login works
- [ ] Step 9: Tenant landing reflects active subscription
- [ ] 9a: Declined card doesn't activate tenant
- [ ] 9b: Webhook delay handled gracefully
- [ ] 9c: Duplicate subdomain rejected

---

## Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| "No Stripe key found" | `STRIPE_SECRET_KEY` not in env | Add to `backend/.env`, restart |
| Webhook 401/signature failed | Wrong `STRIPE_WEBHOOK_SECRET` | Copy from `stripe listen` output, restart backend |
| Webhook not received | Stripe CLI not running OR firewall | Run `stripe listen` in terminal, check no localhost firewall |
| Tenant created but never activated | Webhook handler errors | Check backend logs for stack trace at webhook arrival |
| Redirect URL wrong | `STRIPE_SUCCESS_URL` env mismatch | Set to `http://localhost:3007/success?session_id={CHECKOUT_SESSION_ID}` |

---

## Production prep before going live

1. Replace test keys with live: `sk_live_...`, `pk_live_...`
2. Configure Stripe webhook in Stripe Dashboard pointing at `https://api.laundrylobby.com/api/public/signup/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` to the live one (different from test)
4. Test with a real card (small amount, then refund)
5. Verify Stripe radar / fraud rules
6. Set up Stripe-side dunning for failed renewals
7. Configure proper email templates (Brevo) for payment receipt
