# Frontend: Modals vs SlidePanel Analysis

## Already using SlidePanel (components)

All of these **component** modals have been converted to right-to-left SlidePanel:

| Component | Title / Use | Status |
|-----------|-------------|--------|
| `BookingModal.tsx` | Quick Book / Order Placed | ✅ SlidePanel |
| `CreateBranchModal.tsx` | Create New Branch | ✅ SlidePanel |
| `EditBranchModal.tsx` | Edit Branch: {name} | ✅ SlidePanel |
| `AddOnDetailsModal.tsx` | Add-on details | ✅ SlidePanel |
| `AddOnPurchaseModal.tsx` | Purchase Add-on | ✅ SlidePanel |
| `CompactAddOnPurchaseModal.tsx` | Purchase Add-on | ✅ SlidePanel |
| `AddOnUsageModal.tsx` | Usage Statistics | ✅ SlidePanel |
| `AddOnCancelModal.tsx` | Cancel Add-on | ✅ SlidePanel |
| `CreateRuleModal.tsx` | Create Automation Rule | ✅ SlidePanel |
| `EditRuleModal.tsx` | Edit Automation Rule | ✅ SlidePanel |
| `CreateBannerModal.tsx` | Create New Banner | ✅ SlidePanel |
| `EditBannerModal.tsx` | Edit Banner | ✅ SlidePanel |
| `CreateTemplateBannerModal.tsx` | Create Banner | ✅ SlidePanel |
| `CreateSupportUserModal.tsx` | Create Support User | ✅ SlidePanel |
| `SupportUserDetailsModal.tsx` | Support User Details | ✅ SlidePanel |
| `CreateArticleModal.tsx` | Create New Article | ✅ SlidePanel |
| `CreateAdminCampaignModal.tsx` | Create Campaign | ✅ SlidePanel |
| `AddMoneyModal.tsx` | Add Money to Wallet | ✅ SlidePanel |
| `RedeemPointsModal.tsx` | Redeem Reward | ✅ SlidePanel |

---

## Still using Dialog (good candidates for SlidePanel)

| File | Usage | Recommendation |
|------|--------|-----------------|
| **`app/admin/support/users/page.tsx`** | Create Support User (DialogContent max-w-2xl), Edit Support User (DialogContent max-w-2xl) | **Convert to SlidePanel**: Replace `Dialog` + `DialogTrigger` with a Button that sets `showCreateModal(true)`, render `<SlidePanel open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Support User">` with same form. Same for Edit: `<SlidePanel open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit Support User">`. |
| **`components/notifications/NotificationsPageView.tsx`** | Delete notification confirmation (small dialog, sm:max-w-[425px]) | **Optional**: Keep as Dialog (small confirm) or convert to SlidePanel with width="md" for consistency. |

---

## Still using Dialog (recommend keep as Dialog)

| File | Usage | Reason |
|------|--------|--------|
| **`app/admin/branding/page.tsx`** | 1) Exit-without-saving confirm (`showExitModal`). 2) Large preview overlay (fixed inset). | Exit confirm: small Yes/No → keep Dialog. Preview: could stay fixed overlay or become SlidePanel. |
| **`components/ui/ConfirmDialog.tsx`** | Generic Yes/No confirmation | Small confirm → keep center Dialog. |
| **`components/SessionTimeoutModal.tsx`** | Session expired message | Small center modal → keep as is. |

---

## Inline fixed-overlay modals (in pages)

These pages use **inline** `<div className="fixed inset-0 bg-black/50 ...">` (or similar) for forms, detail views, or confirmations. Converting each to SlidePanel would make the app consistent (right-to-left panel everywhere).

### Tenant routes

| File | What opens | Suggestion |
|------|------------|------------|
| `app/[tenant]/support/[id]/page.tsx` | Feedback modal | SlidePanel "Feedback" |
| `app/[tenant]/orders/[id]/page.tsx` | Rating modal, Cancel order modal | SlidePanel for each (or keep small and use Dialog) |
| `app/[tenant]/reviews/page.tsx` | WriteReviewModal (inline) | Extract to component + SlidePanel "Write Review" |
| `app/[tenant]/all-reviews/page.tsx` | Report modal | SlidePanel "Report Review" |
| `app/[tenant]/customer/support/[id]/page.tsx` | Some overlay | SlidePanel if it’s a form/detail view |

### Admin routes

| File | What opens | Suggestion |
|------|------------|------------|
| `app/admin/inventory/page.tsx` | Add Item, Stock Update, Request Item modals | SlidePanel for each (Add Item, Update Stock, Request Item) |
| `app/admin/pricing/page.tsx` | Pricing modal | SlidePanel |
| `app/admin/payments/page.tsx` | Payment modal | SlidePanel |
| `app/admin/blog/categories/page.tsx` | Category create/edit | SlidePanel |
| `app/admin/chat/page.tsx` | Chat overlay/modal | SlidePanel if it’s a side detail |
| `app/admin/tickets/[id]/page.tsx` | Ticket detail/modal | SlidePanel |
| `app/admin/discounts/page.tsx` | Create/Edit discount (createPortal + fixed) | SlidePanel |
| `app/admin/logistics/page.tsx` | Create/Edit logistics partner | SlidePanel |

### Branch / Center-admin routes

| File | What opens | Suggestion |
|------|------------|------------|
| `app/branch/orders/page.tsx` | Order modals | SlidePanel |
| `app/branch/staff/page.tsx` | Staff modals | SlidePanel |
| `app/center-admin/staff-types/page.tsx` | Staff type modals | SlidePanel |
| `app/center-admin/staff/page.tsx` | Staff modals | SlidePanel |
| `app/center-admin/services/page.tsx` | Service modals | SlidePanel |
| `app/center-admin/orders/page.tsx` | Order modals | SlidePanel |
| `app/center-admin/inventory/page.tsx` | Inventory modals | SlidePanel |

### Customer routes

| File | What opens | Suggestion |
|------|------------|------------|
| `app/customer/reviews/page.tsx` | Review modal | SlidePanel |
| `app/customer/orders/new/page.tsx` | Order/confirm overlay | SlidePanel if it’s a form/summary |

### Shared components

| File | What opens | Suggestion |
|------|------------|------------|
| `components/notifications/NotificationBell.tsx` | Dropdown (fixed overlay) | Keep as overlay/popover (not a detail panel). |
| `components/customer/BannerDisplay.tsx` | Banner detail overlay | SlidePanel "Banner" |
| `components/banners/BannerPreview.tsx` | Preview overlay | SlidePanel "Preview" |
| `components/banners/BannerAnalyticsDashboard.tsx` | Analytics overlay | SlidePanel "Analytics" |
| `components/BarcodeScanner.tsx` | Scanner UI overlay | Could stay fullscreen or use SlidePanel. |
| `components/superadmin/TenancyManagement.tsx` | Create/Edit tenancy (fixed) | SlidePanel |

### Layout / landing (different pattern)

| File | Usage | Recommendation |
|------|--------|----------------|
| `components/layout/ThemeSettingsPanel.tsx` | Overlay for theme panel | Panel pattern → keep or align with SlidePanel if desired. |
| `components/layout/SettingsPanel.tsx` | Overlay for settings | Same as above. |
| `components/landing/templates/*.tsx` (LaundryMaster, Original, Minimal, FreshSpin) | Mobile menu / overlay | Navigation overlay → usually not converted to SlidePanel. |

---

## Summary

- **Component modals**: All listed *Modal components already use SlidePanel.
- **Dialog → SlidePanel**: Strong candidates are **admin/support/users** (Create + Edit Support User). Optional: NotificationsPageView delete confirm, branding exit confirm (can stay Dialog).
- **Inline fixed overlay → SlidePanel**: Many pages still use `fixed inset-0 bg-black/50` for forms and detail views; converting these to SlidePanel would align the whole frontend with the “modals → side panel” direction.

Recommended next steps:

1. Convert **admin/support/users/page.tsx** Create and Edit flows from Dialog to SlidePanel.
2. Optionally convert **NotificationsPageView** delete confirmation to SlidePanel (or leave as Dialog).
3. Then, in batches, replace inline fixed-overlay modals in the listed pages with SlidePanel (and, where useful, extract inline JSX into small modal components that use SlidePanel).
