

## [1.0.9] - 2026-03-23

### Added
- **Socket.IO Relay Server**: Migrated real-time notifications to dedicated relay server
  - Separate Socket.IO relay backend (`socket-relay-server`) for scalable WebSocket handling
  - Decoupled real-time events from main backend API
  - Room-based routing: user, tenant, role-specific rooms
  - JWT authentication on socket connections

- **Enterprise Notification Engine**: Complete notification system across all roles
  - 40+ notification methods wired into controllers (order, payment, inventory, support, security, subscription, team, leads)
  - Role-based platform notification routing (SuperAdmin, Finance, Sales, Auditor, Support)
  - Type-specific notification detail drawer with 11 specialized views (Order, Payment, Inventory, Support, Security, Subscription, Permission, Tenancy, Lead, Team, Rewards)
  - Central navigation utility (`getNotificationRoute.ts`) for click-to-navigate from notifications
  - Priority-based filtering (P0-P4) with toast deduplication
  - Real-time WebSocket notifications for all admin roles

- **Customer Creation by Tenant Admin**: Admin can now create customers directly
  - Create customer form within admin dashboard
  - Auto-assign to tenant and branch

### Fixed
- Duplicate toast notifications spam on SuperAdmin dashboard
- Notification priority filter not working on SuperAdmin notifications page
- Redundant `newOrder` WebSocket event causing double notifications
- Duplicate notification delivery in relay service

### Changed
- Bumped version to 1.0.9 across all projects
- Removed unused Firebase admin config from backend
- SuperAdmin notification bell migrated from polling to WebSocket

---

## [2.0.0] - 2026-01-09

### Added
- **Banner System**: banner management 
  - Admin can create template-based banners
  - SuperAdmin can create global banners
  - Support for multiple promotion types (campaigns, discounts, coupons, referrals, loyalty)
  - Banner display on customer frontend with multiple positions
  - Barcode display in order lists (admin and customer)
  
- **Tenant Navigation**: Fixed tenant-aware navigation
  - Services, Help, Pricing pages stay within tenant context
  - URL detection fallback for navigation
  - Tenant layout for consistent context
  
- **Order Barcodes**: Added scannable barcodes to order lists
  - Barcodes visible in admin orders list
  - Barcodes visible in customer orders list
  - Barcode-only mode for compact display
  

### Changed
- Moved Campaigns and Banners to Programs section in admin sidebar
- Moved Campaigns and Banners to Global Programs in SuperAdmin sidebar
- Updated banner API to support multiple promotion types




---

