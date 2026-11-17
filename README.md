# Billora — Smart Billing. Simple Business.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

**Billora** is a commercial-grade Billing & Subscription Management SaaS platform engineered for modern B2B/B2C SaaS businesses. Inspired by Stripe, Linear, and modern financial management systems, Billora provides complete lifecycle control over customer billing, recurring pricing plans, subscription upgrades/downgrades, invoice generation with automated tax and discount math, vector PDF exports, simulated multi-channel payment settlement, and real-time MRR analytics.

This is a full-stack, production-ready portfolio application backed by real MongoDB database operations and RESTful Next.js API Route Handlers.

---

## 🌟 Key Features & Capabilities

### 1. Executive Dashboard & Metrics
- **Real-Time KPIs**: Total Lifetime Revenue, Monthly Recurring Revenue (MRR), Active Subscriptions, Total Customers, Pending Invoices, and Overdue Invoices with month-over-month percentage comparisons.
- **Monthly Revenue Area Chart**: Interactive Recharts visualization with 3M, 6M, and 12M historical ranges.
- **Subscription Overview**: Status distribution (Active, Paused, Cancelled, Past Due).
- **Recent Payments Stream**: Live feed of recent transaction records with payment methods and statuses.
- **Upcoming Renewals**: Calendar preview of impending billing renewals and renewal amounts.
- **Audit Activity Feed**: Real-time event log tracking customer onboardings, plan changes, invoice creation, and payment settlements.

### 2. Customer Management (CRM)
- **Full CRUD Support**: Add, inspect, update, and manage customer accounts.
- **Rich Customer Profiles**: Full Name, Email, Phone, Company, Street Address, City, State, Country, Postal Code.
- **Aggregated Financial Metrics**: Total lifetime spending, active subscriptions count, total invoices count, and unpaid balance.
- **Multi-Tab Customer Details**:
  - **Overview**: Contact info, company data, billing address, and active subscriptions.
  - **Subscriptions**: All subscriptions belonging to the customer with direct action triggers.
  - **Invoices**: Comprehensive billing history with payment status stamps.
  - **Payments**: Audit trail of every transaction made by the customer.
- **Safe Archival Strategy**: Accidental deletions are prevented for customers with active subscriptions or outstanding balances. Records are safely archived to protect financial audit integrity.

### 3. Products & Pricing Catalog
- **Product Packaging**: Define SaaS software packages, add-ons, support tiers, and compliance modules.
- **Flexible Pricing Plans**:
  - **Cadence**: Monthly, Yearly, and One-time billing intervals.
  - **Multi-Currency**: USD ($), EUR (€), GBP (£), INR (₹).
  - **Active / Inactive Status**: Inactive tiers are prevented from new subscriptions while preserving existing subscription contracts.
- **Modern Pricing Cards**: Interactive cards displaying plan limits, recurring amounts, and features.

### 4. Subscription Lifecycle Engine
- **Wizard Onboarding**: Select customer, product, and active plan with real-time billing cadence and renewal date calculation.
- **Month-End Edge Case Handling**: Safe date arithmetic for monthly and yearly recurrences using `date-fns`.
- **Lifecycle Actions**:
  - **Pause Subscription**: Halts renewal billing (records history note).
  - **Resume Subscription**: Re-activates subscription and dynamically recalculates the next billing date.
  - **Cancel Subscription**: Safely cancels subscription, records cancellation timestamp, and clears future renewals.
  - **Change Plan (Upgrade/Downgrade)**: Seamlessly switch active plans, capturing historical plan snapshots.
  - **Simulate Renewal**: Generates a real pending invoice on the fly and advances the subscription renewal date.
- **Full History Log**: Every status transition is timestamped and recorded in the subscription's internal audit log.

### 5. Invoice Management & Vector PDF Export
- **Automated & Manual Generation**: Invoices are generated automatically on subscription activation/renewal or manually with custom line items.
- **Server-Side Financial Engine**:
  - `Subtotal = Σ(Quantity × Unit Price)`
  - `Discount Amount = Subtotal × Discount%` (or fixed amount)
  - `Taxable Amount = Subtotal - Discount Amount`
  - `Tax Amount = Taxable Amount × Tax%`
  - `Total Amount = Taxable Amount + Tax Amount`
  - `Remaining Balance = Total Amount - Paid Amount`
- **Statuses**: `draft`, `pending`, `paid`, `overdue`.
- **Branded Vector PDF Export**: Download professional invoices powered by `jsPDF` featuring business legal info, customer billing address, itemized table, tax breakdown, and payment status stamps.
- **Print Friendly**: Built-in print stylesheets for clean hard-copy printing.

### 6. Simulated Payment Settlement
- **Multi-Channel Methods**: Simulated Credit Card, Bank Transfer / Wire, UPI / QR, and Direct Cash.
- **Partial Payments**: Record partial payments against invoices; invoice status automatically transitions to `paid` once the balance reaches zero.
- **Financial Consistency**:
  - Overpayment prevention: Payment amounts cannot exceed the outstanding invoice balance.
  - Failed or pending payments do not inflate collected revenue metrics.
  - Every transaction generates a unique reference ID (e.g. `TXN-BILLORA-789001`).

### 7. SaaS Financial Analytics
- **Time Range Selectors**: Last 7 Days, Last 30 Days, 3 Months, 6 Months, 12 Months, and All Time.
- **Key Metrics**: Collected Revenue, MRR, Annual Run Rate (ARR = MRR × 12), Average Revenue Per Customer (ARPU), Payment Success Rate (%), and Outstanding Balance.
- **Charts**:
  - Daily Revenue Trajectory (Area Chart).
  - MRR Contribution by Product (Horizontal Bar Chart).
  - Payment Method Volume Distribution (Donut Chart).
  - Invoice Status Breakdown (Bar Chart).
  - Revenue by Billing Interval (Donut Chart).

### 8. Platform & Organization Settings
- **Legal Profile**: Business Legal Name, Email, Phone, and Street Address.
- **Billing Defaults**: Default Currency, Default Sales Tax %, Invoice Number Prefix (e.g. `INV`), and Payment Due Days.
- **Demo Data Management**: Built-in 1-click database re-seed tool to restore sample data anytime.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router) | React Server Components & Client Components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type safety across frontend and backend |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern design system, dark sidebar, clean typography |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent financial and navigation iconography |
| **Charts** | [Recharts](https://recharts.org/) | Responsive SVG charts (Area, Bar, Donut) |
| **Validation** | [Zod](https://zod.dev/) | Strict runtime payload validation |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) & [Mongoose ODM](https://mongoosejs.com/) | Document models, compound indexes, connection caching |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) | High-fidelity client-side PDF document generation |
| **Date Arithmetic** | [date-fns](https://date-fns.org/) | ISO parsing, month-end calculations, formatting |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Polished toast notifications |

---

## 🗄️ Database Architecture & Mongoose Models

Billora organizes data into 8 indexed Mongoose collections:

1. **`Customer`**:
   - `fullName`, `email` (unique index), `phoneNumber`, `companyName`, `billingAddress`, `city`, `state`, `country`, `postalCode`, `isArchived`.
2. **`Product`**:
   - `name`, `description`, `category`, `status` (`active` | `archived`), virtual `plans`.
3. **`PricingPlan`**:
   - `name`, `productId` (ObjectId ref), `amount`, `currency`, `billingInterval` (`monthly` | `yearly` | `one-time`), `billingIntervalCount`, `isActive`, `description`.
4. **`Subscription`**:
   - `subscriptionId` (unique), `customerId`, `productId`, `pricingPlanId`, `amount`, `currency`, `billingInterval`, `startDate`, `nextBillingDate`, `cancelledAt`, `status` (`active` | `paused` | `cancelled` | `past_due`), `history` array.
5. **`Invoice`**:
   - `invoiceNumber` (unique), `customerId`, `subscriptionId`, `issueDate`, `dueDate`, `lineItems`, `subtotal`, `discountType`, `discountValue`, `discountAmount`, `taxableAmount`, `taxRate`, `taxAmount`, `totalAmount`, `paidAmount`, `balance`, `currency`, `status` (`draft` | `pending` | `paid` | `overdue`).
6. **`Payment`**:
   - `paymentId` (unique), `invoiceId`, `customerId`, `amount`, `paymentDate`, `paymentMethod`, `paymentStatus`, `transactionReference`, `notes`.
7. **`Activity`**:
   - `type`, `title`, `description`, `entityId`, `entityType`, `metadata`, `createdAt`.
8. **`BusinessSettings`**:
   - `businessName`, `businessEmail`, `businessPhone`, `businessAddress`, `city`, `state`, `country`, `postalCode`, `defaultCurrency`, `defaultTaxPercentage`, `invoicePrefix`, `defaultPaymentDueDays`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node v24)
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone & Install
```bash
git clone https://github.com/Jilanmansuri/payora-billing-saas.git
cd payora-billing-saas
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# MongoDB Connection String (Local MongoDB or Atlas cluster)
MONGODB_URI=mongodb://127.0.0.1:27017/billora

# Base Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Seed Database with Realistic Data
Populate the database with 15 customers, 8 products, 12 pricing tiers, 20 subscriptions, 30 invoices, 35 payments, and sample activity records:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the application.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🌐 Application Routes

| Route | Description |
|---|---|
| `/` | Modern marketing landing page with hero, interactive preview, feature grid, and CTAs |
| `/dashboard` | Business overview with KPI cards, revenue area chart, upcoming renewals, and payments |
| `/customers` | Customer table with search, spending summaries, active subscriptions count, and modal |
| `/customers/new` | Dedicated customer creation form |
| `/customers/[id]` | Customer profile with tabs: Overview, Subscriptions, Invoices, Payments |
| `/products` | Product & pricing tier catalog with interactive cards and plan creation modal |
| `/products/new` | Product creation page |
| `/products/[id]` | Product detail view with associated plans |
| `/subscriptions` | Recurring subscriptions table with status filters (active, paused, cancelled, past_due) |
| `/subscriptions/new`| Subscription wizard with live pricing and renewal schedule calculation |
| `/subscriptions/[id]`| Subscription detail view with Pause, Resume, Cancel, Change Plan, and Simulate Renewal |
| `/invoices` | Invoices table with status filters (draft, pending, paid, overdue) and PDF downloads |
| `/invoices/new` | Interactive invoice builder with dynamic line items and live math calculation |
| `/invoices/[id]` | Complete printable invoice detail view with partial payment recorder and PDF export |
| `/payments` | Payment transactions audit table with method filters and payment recorder modal |
| `/analytics` | Financial analytics dashboard with MRR waterfalls, ARPU, success rates, and charts |
| `/settings` | Organization legal details, invoice prefixes, tax rates, and database re-seed tool |

---

## 📡 Backend API Reference

### Customers
- `GET /api/customers` — Paginated customers with search & aggregated financial stats
- `POST /api/customers` — Create customer with email uniqueness check
- `GET /api/customers/[id]` — Customer details with subscriptions, invoices, and payments
- `PUT /api/customers/[id]` — Update customer profile
- `DELETE /api/customers/[id]` — Safe deletion / archival protecting financial records

### Products & Plans
- `GET /api/products` — List products with populated plans
- `POST /api/products` — Create product
- `GET /api/products/[id]` — Product details with plans
- `PUT /api/products/[id]` — Update product
- `DELETE /api/products/[id]` — Archive product
- `GET /api/plans` — List active pricing plans
- `POST /api/plans` — Create pricing plan tier
- `PUT /api/plans/[id]` — Update plan
- `DELETE /api/plans/[id]` — Safe deactivate or delete plan

### Subscriptions
- `GET /api/subscriptions` — Paginated subscriptions with search and status filters
- `POST /api/subscriptions` — Create subscription and auto-generate initial invoice
- `GET /api/subscriptions/[id]` — Subscription details with audit history and linked invoices
- `POST /api/subscriptions/[id]/pause` — Pause active subscription
- `POST /api/subscriptions/[id]/resume` — Resume subscription and recalculate billing date
- `POST /api/subscriptions/[id]/cancel` — Cancel subscription
- `POST /api/subscriptions/[id]/change-plan` — Upgrade / downgrade subscription plan
- `POST /api/subscriptions/[id]/renew` — Simulate manual renewal and generate renewal invoice

### Invoices
- `GET /api/invoices` — Paginated invoices with status, customer, and date filters
- `POST /api/invoices` — Create invoice with server-side validation and math
- `GET /api/invoices/[id]` — Invoice details with payment records
- `PUT /api/invoices/[id]` — Update draft invoice
- `DELETE /api/invoices/[id]` — Delete draft invoice (locked if payments exist)
- `GET /api/invoices/[id]/pdf` — Invoice data snapshot for PDF generation

### Payments
- `GET /api/payments` — Paginated payments with method, status, and date filters
- `POST /api/payments` — Record payment, update invoice paid amount/balance, and auto-transition status

### Dashboard & Analytics
- `GET /api/dashboard/stats` — Real-time KPI metrics and month-over-month comparisons
- `GET /api/dashboard/revenue` — Monthly revenue trajectory and subscription breakdown
- `GET /api/dashboard/upcoming-renewals` — Impending subscription renewals
- `GET /api/dashboard/recent-activity` — Recent activity stream
- `GET /api/analytics/overview` — Full analytics suite with range filter (7d, 30d, 3m, 6m, 12m, all)

### Settings & Seeding
- `GET /api/settings` — Get business settings
- `PUT /api/settings` — Update business settings
- `POST /api/seed` — Seed or re-seed database with realistic demo data

---

## 🚢 Deployment to Vercel & MongoDB Atlas

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere).
4. Copy your connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/billora?retryWrites=true&w=majority`

### 2. Vercel Deployment
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/), click **Add New Project** and import `payora-billing-saas`.
3. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `NODE_ENV`: `production`
4. Click **Deploy**.
5. Once deployed, open the live URL and navigate to **Settings** -> Click **Reset & Re-Seed Database** (or send a POST to `/api/seed`) to populate your live Atlas database with sample data.

---

## 📄 License
This project is open-source under the MIT License.
