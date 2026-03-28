# Hotelify Next-Gen PMS - Complete Feature List

## 1. Multi-Tenant SaaS Engine
- **Tenant Isolation & Security**: Row-Level Security (RLS) ensures absolute data privacy between different hotel organizations.
- **Dedicated Workspaces**: Subdomain-based routing automatically detects and loads the respective hotel's workspace.
- **Role-Based Access Control (RBAC)**: Secure separation between global Platform Admins and hotel-specific staff (Owners, Managers, Front Desk).

## 2. Platform Administration & Billing (Superadmin)
- **Centralized Command Center**: Global dashboard for platform owners to manage all subscribed hotels.
- **Instant Impersonation**: Platform admins can securely log into any client's dashboard with one click for high-level support.
- **Modular Subscriptions**: Tier-based pricing (Growth, Pro, Enterprise) dynamically calculated based on the hotel's active room count.
- **Organization Lifecycle**: Full control over hotel accounts including Free Trial periods, Active subscriptions, and Suspended states.

## 3. Intelligent Property Onboarding (Setup Wizard)
- **Guided Setup Guard**: Mandatory 3-step initialization wizard for new hotels before accessing operations.
- **Property Identity Management**: Digital branding, tax details (GSTIN), contact info, and operational policies.
- **Master Category Definition**: Create flexible room types (e.g., Executive Suite, Deluxe) defining base occupancy and pricing.
- **Asset Inventory Tracking**: Bulk or individual addition of room numbers mapping to physical inventory capacity.

## 4. Advanced Front-Desk Operations
- **Interactive Booking Engine**: Multi-stage reservation dialog supporting real-time capacity scans and room category filtering.
- **Dual-Guest Modes**: Specialized workflows for both Individual Travelers and Corporate Guests (capturing precise billing entities).
- **Temporal Capacity Scanning**: Prevents overbooking by checking precise date-overlap logic against existing reservations.
- **Stay Cycle Management**: Dynamic transition of reservations from Confirmed → Checked-In → Checked-Out.

## 5. Financial & Billing Management
- **Folio Ledgers**: Automated tracking of room charges, advance deposits, and settlement balances.
- **Receivables & Advance Booking**: Support for upfront advance capture during booking with live impact on the total due.
- **Tax Allocation (GST Engine)**: Automated tax calculations based on property-defined percentages and dynamic switches per booking.
- **Payment Enforcement**: Strict checkout guards preventing room un-allocation until the guest ledger balance zeroes out.
- **Professional Invoice Generation**: Instantly generate structured, print-ready PDF invoices featuring property logos, distinct tax breakdowns, and payment methods.

## 6. Real-Time Room & Asset Management
- **Housekeeping Workflows**: Visual board to track room states (Clean, Dirty, Maintenance).
- **Housekeeping History Logging**: Un-editable audit trail capturing exactly when a room's state changed and by whom.
- **Live Allocation UI**: Color-coded physical dashboard to see exactly what rooms are Available, Occupied, or under Maintenance.

## 7. Guest Experience & Intelligence
- **Global Guest Registry**: Centralized repository of all guests visiting the property.
- **Instant Auto-Fill**: Searching by phone number immediately injects previous guest details and ID numbers into new bookings.
- **Guest Visit History**: Unified profiles aggregating lifetime bookings across the property to identify VIPs or frequent travelers.

## 8. Premium Technical Architecture
- **Glassmorphic UI Engine**: Heavily customized Radix Primitives and Tailwind CSS enforcing a dark-mode-first luxury aesthetic.
- **Next.js Server Actions (Turbopack)**: State-of-the-art server-side data mutations ensuring speed, SEO, and cache reliability.
- **Zero-Latency State**: Optimistic UI updates paired with deep transition guards for a native-app feel on the web.
- **Responsive Architecture**: Fully optimized semantic HTML scaling gracefully from ultra-wide administration displays to mobile housekeeping devices.
