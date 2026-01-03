# Frontend Project Structure & Architecture

## 📋 Complete Folder Structure

```
frontend/
├── public/                          # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/                         # Next.js App Router (Pages)
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── customer/                # Customer routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/                   # Admin routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── refunds/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── branch/                  # Branch Manager routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── staff/
│   │   │   │   └── page.tsx
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── support/                 # Support Agent routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── center-admin/            # Center Admin routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── branches/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   │
│   ├── components/
│   │   ├── ui/                      # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── spinner.tsx
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── MobileMenu.tsx
│   │   │
│   │   ├── forms/                   # Form components
│   │   │   ├── OrderForm.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── TicketForm.tsx
│   │   │
│   │   ├── customer/                # Customer-specific components
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderTracker.tsx
│   │   │   ├── AddressCard.tsx
│   │   │   ├── PriceCalculator.tsx
│   │   │   └── RatingForm.tsx
│   │   │
│   │   ├── admin/                   # Admin-specific components
│   │   │   ├── OrderAssignment.tsx
│   │   │   ├── CustomerList.tsx
│   │   │   ├── RefundForm.tsx
│   │   │   └── AnalyticsCard.tsx
│   │   │
│   │   ├── branch/                  # Branch-specific components
│   │   │   ├── StaffAssignment.tsx
│   │   │   ├── InventoryTable.tsx
│   │   │   └── OrderProcessing.tsx
│   │   │
│   │   ├── support/                 # Support-specific components
│   │   │   ├── TicketList.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   └── TicketDetails.tsx
│   │   │
│   │   ├── shared/                  # Shared components
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   └── providers.tsx            # App providers
│   │
│   ├── lib/
│   │   ├── api.ts                   # API configuration
│   │   ├── utils.ts                 # Utility functions
│   │   ├── socket.ts                # Socket.io configuration
│   │   └── constants.ts             # App constants
│   │
│   ├── store/
│   │   ├── authStore.ts             # Authentication state
│   │   ├── orderStore.ts            # Order state
│   │   ├── notificationStore.ts     # Notification state
│   │   └── uiStore.ts               # UI state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useOrders.ts             # Orders hook
│   │   ├── useNotifications.ts      # Notifications hook
│   │   ├── useSocket.ts             # Socket.io hook
│   │   ├── useDebounce.ts           # Debounce hook
│   │   └── useMediaQuery.ts         # Media query hook
│   │
│   ├── types/
│   │   ├── user.ts                  # User types
│   │   ├── order.ts                 # Order types
│   │   ├── address.ts               # Address types
│   │   ├── notification.ts          # Notification types
│   │   └── api.ts                   # API response types
│   │
│   └── constants/
│       ├── routes.ts                # Route constants
│       ├── orderStatus.ts           # Order status constants
│       ├── roles.ts                 # User role constants
│       └── pricing.ts               # Pricing constants
│
├── .env.local                       # Environment variables
├── .gitignore
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── postcss.config.js                # PostCSS configuration
├── package.json
└── README.md
```

## 🎯 Architecture Decisions

### 1. Next.js App Router
- Server and client components
- File-based routing
- Built-in API routes (if needed)
- Optimized performance

### 2. Feature-Based Organization
- Components grouped by feature/role
- Easier to maintain and scale
- Clear separation of concerns

### 3. State Management Strategy
- **Zustand**: Client state (auth, UI)
- **React Query**: Server state (API data)
- **Context**: Theme, locale (if needed)

### 4. Component Hierarchy
```
App Layout (Root)
├── Providers (Query, Toast, etc.)
├── Role-Based Layout
│   ├── Navbar
│   ├── Sidebar
│   └── Main Content
│       └── Page Components
│           └── Feature Components
│               └── UI Components
```

## 🔐 Route Protection Strategy

### Middleware-based Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl
  
  // Check authentication
  // Check role-based access
  // Redirect if unauthorized
}
```

### Role-Based Routes
- `/customer/*` - Customer only
- `/admin/*` - Admin only
- `/branch/*` - Branch Manager only
- `/support/*` - Support Agent only
- `/center-admin/*` - Center Admin only

## 📱 Responsive Design Strategy

### Mobile-First Approach
1. Design for mobile (320px+)
2. Enhance for tablet (768px+)
3. Optimize for desktop (1024px+)

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

### Responsive Components
- Collapsible sidebar on mobile
- Bottom navigation for mobile
- Adaptive tables (cards on mobile)
- Touch-friendly buttons and inputs

## 🎨 Design System

### Color Palette
```typescript
colors: {
  primary: '#3B82F6',    // Blue
  secondary: '#6B7280',  // Gray
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Amber
  error: '#EF4444',      // Red
  info: '#3B82F6',       // Blue
}
```

### Typography
- Font: Inter (Google Fonts)
- Sizes: text-xs to text-6xl
- Weights: 400, 500, 600, 700

### Spacing
- Base unit: 4px (0.25rem)
- Scale: 0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64

## 🔄 Data Flow

### Authentication Flow
```
Login → API Call → Store Token → Redirect to Dashboard
```

### Order Creation Flow
```
Form Input → Validation → API Call → Success → Redirect
```

### Real-time Updates
```
Socket Connection → Event Listener → Update Store → Re-render
```

## 🚀 Performance Optimization

### Code Splitting
- Route-based splitting (automatic)
- Component lazy loading
- Dynamic imports for heavy components

### Image Optimization
- Next.js Image component
- WebP format
- Lazy loading
- Responsive images

### Caching Strategy
- React Query cache
- Browser cache
- Service worker (PWA)

## 🧪 Testing Strategy (Future)

### Unit Tests
- Component testing (Jest + React Testing Library)
- Hook testing
- Utility function testing

### Integration Tests
- API integration
- Form submission
- Navigation flow

### E2E Tests
- Critical user journeys
- Role-based workflows
- Payment flow

## 📊 Monitoring & Analytics

### Performance Metrics
- Core Web Vitals
- Time to Interactive
- First Contentful Paint
- Largest Contentful Paint

### User Analytics
- Page views
- User interactions
- Conversion tracking
- Error tracking

---

This structure provides a scalable, maintainable, and performant foundation for the laundry management system frontend.