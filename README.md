# Restro Analytics

An end-to-end, self-hosted analytics system built on top of a restaurant demo application.  
The system captures browser events, server-side business events, stores them in a relational database, and visualises the data on a real-time dashboard.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Local Setup](#local-setup)
4. [SDK Integration Examples](#sdk-integration-examples)
5. [API Reference](#api-reference)
6. [Dashboard](#dashboard)
7. [Running Tests](#running-tests)
8. [Key Decisions](#key-decisions)
9. [Assumptions](#assumptions)
10. [Tradeoffs](#tradeoffs)
11. [Known Limitations](#known-limitations)

---

## Architecture

The system is composed of four independently deployable pieces:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (Next.js 16 SPA)                                           │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐  │
│  │  Browser SDK     │    │  Analytics Dashboard (/analytics)    │  │
│  │  analytics.js    │    │  React + Recharts                    │  │
│  │  · autoPage()    │    │  · KPI cards                         │  │
│  │  · track()       │    │  · Time-series chart                 │  │
│  │  · batching      │    │  · Funnel, Sources, Live Feed        │  │
│  │  · sendBeacon    │    │  · Date-range filter                 │  │
│  └────────┬─────────┘    └──────────────┬───────────────────────┘  │
└───────────┼──────────────────────────────┼──────────────────────────┘
            │ POST /api/events              │ GET /api/analytics/*
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Laravel 12 API (backend)                                           │
│                                                                     │
│  ┌────────────────────┐    ┌────────────────────────────────────┐  │
│  │  Events Module     │    │  Analytics Module                  │  │
│  │  · EventsController│    │  · AnalyticsController             │  │
│  │  · EventRepository │    │  · AnalyticsRepository             │  │
│  │  · Batch insert    │    │  · 7 query methods                 │  │
│  │  · Validation      │    │  · Date-range + pagination         │  │
│  └────────┬───────────┘    └──────────────┬─────────────────────┘  │
└───────────┼──────────────────────────────────────────────────────── ┘
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MySQL 8 — events table (single-table design, 17 columns, 6 indexes)│
└─────────────────────────────────────────────────────────────────────┘
            ▲
            │ POST /api/events (source: "server")
┌───────────┴──────────────────┐
│  PHP Server Tracker          │
│  sdk/src/ServerTracker.php   │
│  · Any PHP app / POS / job   │
└──────────────────────────────┘
```

**Request flow summary:**

| Source | Path |
|--------|------|
| Browser SDK | `analytics.js` → batch → `POST /api/events` → MySQL |
| Server Tracker | `ServerTracker::track()` → `POST /api/events` → MySQL |
| Dashboard | Next.js → `GET /api/analytics/*` → MySQL → Recharts |

---

## Project Structure

```
restro-analytics/
│
├── backend/                        Laravel 12 API
│   ├── Modules/
│   │   ├── Events/                 Event ingestion module
│   │   │   ├── app/
│   │   │   │   ├── Http/Controllers/EventsController.php
│   │   │   │   ├── Models/Event.php
│   │   │   │   └── Repositories/
│   │   │   │       ├── Contracts/EventRepositoryInterface.php
│   │   │   │       └── EventRepository.php
│   │   │   ├── database/
│   │   │   │   ├── migrations/     events table schema + indexes
│   │   │   │   └── seeders/        30-day realistic demo data
│   │   │   └── routes/api.php      POST /api/events
│   │   │
│   │   └── Analytics/              Analytics query module
│   │       ├── app/
│   │       │   ├── Http/Controllers/AnalyticsController.php
│   │       │   └── Repositories/
│   │       │       ├── Contracts/AnalyticsRepositoryInterface.php
│   │       │       └── AnalyticsRepository.php
│   │       └── routes/api.php      GET /api/analytics/*
│   │
│   ├── app/Http/Controllers/
│   │   └── DemoCheckoutController.php   Server-side event demo endpoint
│   └── routes/api.php
│
├── frontend/                       Next.js 16 restaurant demo
│   ├── app/
│   │   ├── page.tsx                Homepage (Zomato-style landing)
│   │   ├── menu/page.tsx           Menu + cart (tracks add_to_cart, order_created)
│   │   ├── reservations/page.tsx   Booking form (tracks full reservation funnel)
│   │   ├── about/page.tsx
│   │   └── analytics/              Analytics dashboard
│   │       ├── page.tsx            Auth guard → AnalyticsDashboard
│   │       ├── AnalyticsDashboard.tsx
│   │       └── login/page.tsx
│   ├── components/
│   │   └── Navbar.tsx              Shared sticky nav
│   └── lib/
│       ├── analytics.js            Browser SDK (copy of sdk/src/analytics.js)
│       ├── analytics-provider.tsx  React Context wrapper + useAnalytics() hook
│       ├── api.ts                  Typed fetch client for analytics API
│       └── auth.ts                 Simple token-based auth helpers
│
└── sdk/                            Reusable, framework-agnostic SDK
    ├── package.json                npm package descriptor
    ├── composer.json               Composer package descriptor
    ├── src/
    │   ├── analytics.js            Browser SDK (ESM + UMD, zero-dep, ~3 KB)
    │   ├── analytics.d.ts          TypeScript declarations
    │   └── ServerTracker.php       PHP server-side event tracker
    └── examples/
        └── demo_server_events.php  CLI demo — fires 3 server events live
```

---

## Local Setup

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| PHP | 8.2 |
| Composer | 2.x |
| MySQL | 8.0 |
| Node.js | 18 |
| npm | 9 |

> **XAMPP users:** start Apache + MySQL in the XAMPP control panel before proceeding.

---

### Step 1 — Create the database

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS restro_analytics \
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

If your MySQL root account uses a password, add `-p`.

---

### Step 2 — Backend (Laravel API)

```bash
cd backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env          # already has sane defaults for XAMPP

# Generate app key
php artisan key:generate

# Run migrations (creates the events table)
php artisan migrate

# (Optional) Seed 30 days of realistic demo data
php artisan db:seed

# Start the API server on port 8080
php artisan serve --port=8080
```

**Key `.env` variables:**

```dotenv
APP_URL=http://localhost:8080
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restro_analytics
DB_USERNAME=root
DB_PASSWORD=            # leave blank for XAMPP default
```

---

### Step 3 — Frontend (Next.js)

```bash
cd frontend

npm install

# Environment is pre-configured — no changes needed for local dev
# NEXT_PUBLIC_API_URL=http://localhost:8080/api
# NEXT_PUBLIC_ANALYTICS_ENDPOINT=http://localhost:8080/api/events

npm run dev             # starts on http://localhost:3000
```

---

### Step 4 — Open in browser

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Restaurant demo (Home, Menu, Reservations, About) |
| `http://localhost:3000/analytics` | Analytics dashboard |
| `http://localhost:3000/analytics/login` | Dashboard login |

**Dashboard credentials:** `admin` / `admin@123`

---

### Step 5 — (Optional) Fire server-side demo events

```bash
cd /path/to/restro-analytics
php sdk/examples/demo_server_events.php
```

This fires three server-side events (`order_confirmed`, `reservation_confirmed`, `payment_processed`) directly at the running API and shows them in the Live Event Feed with `source: server`.

---

## SDK Integration Examples

### Browser SDK — Vanilla HTML

No build step required. Works in any HTML page:

```html
<script type="module">
  import AnalyticsSDK from './sdk/src/analytics.js';

  const analytics = new AnalyticsSDK('https://your-api.example.com/api/events');

  // Track every page view automatically (patches history.pushState + popstate)
  analytics.autoPage();

  // Track a custom event
  analytics.track('add_to_cart', 'Add to Cart', {
    item:  'Braised Short Rib',
    price: 34,
  });

  // Attach a user identity after login
  analytics.identify('user-123');

  // Detach identity after logout
  analytics.reset();
</script>
```

---

### Browser SDK — React / Next.js

**1. Wrap your root layout with `AnalyticsProvider`:**

```tsx
// app/layout.tsx
import { AnalyticsProvider } from '@/lib/analytics-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
```

`AnalyticsProvider` initialises the SDK once on the client, calls `autoPage()`, and exposes the instance through React Context.

**2. Use the hook in any client component:**

```tsx
'use client';
import { useAnalytics } from '@/lib/analytics-provider';

export default function MenuPage() {
  const analytics = useAnalytics();

  function handleAddToCart(item) {
    // sdk may be null during SSR — optional chaining is safe
    analytics?.track('add_to_cart', 'Add to Cart', {
      item:  item.name,
      price: item.price,
    });
  }
}
```

**3. Reservation funnel example (4-step tracking):**

```tsx
// On page load
analytics?.track('reservation_page_viewed', 'Reservation Page Viewed');

// On first field interaction
analytics?.track('reservation_form_started', 'Reservation Form Started');

// On time slot selection
analytics?.track('reservation_time_selected', 'Reservation Time Selected', {
  time: '19:00',
});

// On successful submission
analytics?.track('reservation_completed', 'Reservation Completed', {
  guests: 2,
  date:   '2026-11-15',
});
```

---

### Server-Side Tracker — PHP

Install via Composer (standalone):

```bash
composer require restro-analytics/server-tracker
```

Or copy `sdk/src/ServerTracker.php` directly into any PHP project.

**Usage:**

```php
use RestroAnalytics\ServerTracker;

$tracker = new ServerTracker('http://localhost:8080/api/events');

// Fire a business event from the server
$tracker->track(
    eventType:   'order_confirmed',
    eventName:   'Order Confirmed',
    properties:  [
        'order_id' => 'ORD-001',
        'total'    => 42.50,
        'currency' => 'USD',
        'items'    => [
            ['name' => 'Braised Short Rib', 'qty' => 1, 'price' => 34.00],
            ['name' => 'Tiramisu',          'qty' => 1, 'price' =>  9.50],
        ],
    ],
    // Bridge the browser identity so server events join the same visitor journey
    anonymousId: $_COOKIE['_ra_anon'] ?? null,
    sessionId:   $_COOKIE['_ra_sess'] ?? null,
    userId:      $currentUser?->id,
    pagePath:    '/checkout',
    ip:          $_SERVER['REMOTE_ADDR'],
);
```

Server events appear in the Live Event Feed tagged `source: server`, making them visually distinct from browser events.

---

### Ingestion API — cURL (direct)

```bash
# Single event
curl -s -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "anonymous_id": "a1b2c3d4-0000-4000-8000-000000000001",
    "session_id":   "sess-0001",
    "event_type":   "page_view",
    "event_name":   "Page View",
    "page_path":    "/menu",
    "page_title":   "Menu | Bistro Table",
    "referrer":     "https://www.google.com"
  }'

# Batch (up to 50 events in one request)
curl -s -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '[
    {"anonymous_id":"abc","session_id":"s1","event_type":"page_view","event_name":"Page View","page_path":"/"},
    {"anonymous_id":"abc","session_id":"s1","event_type":"add_to_cart","event_name":"Add to Cart","properties":{"item":"Tiramisu","price":10}}
  ]'
```

**Successful response:**

```json
{ "accepted": 2, "rejected": 0 }
```

---

## API Reference

### Ingestion

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/events` | JSON object or array | Ingest 1–50 events per request |

**Event object fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `anonymous_id` | string (≤64) | ✅ | SDK-generated UUID, persisted in `localStorage` |
| `session_id` | string (≤64) | ✅ | SDK-generated UUID, persisted in `sessionStorage` |
| `event_type` | string (≤64) | ✅ | Snake-case, e.g. `page_view`, `add_to_cart` |
| `event_name` | string (≤128) | ✅ | Human label, e.g. `Add to Cart` |
| `user_id` | string | — | Set after authentication |
| `page_url` | url | — | Full URL |
| `page_path` | string | — | e.g. `/menu` |
| `page_title` | string | — | `document.title` |
| `referrer` | string | — | `document.referrer` |
| `source` | `browser` \| `server` | — | Defaults to `browser` |
| `properties` | object | — | Arbitrary JSON payload |
| `device` | object | — | UA, screen, language, timezone |
| `occurred_at` | ISO 8601 date | — | Defaults to `now()` on the server |

---

### Analytics Queries

All query endpoints accept `start` and `end` as `YYYY-MM-DD` query parameters.  
Defaults to the last 30 days. Range is capped at 365 days.

| Method | Endpoint | Extra params | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/analytics/overview` | `start`, `end` | `{ page_views, unique_visitors, sessions, total_events, orders }` |
| `GET` | `/api/analytics/page-views` | `start`, `end` | Array of `{ date, views, unique_visitors }` |
| `GET` | `/api/analytics/top-pages` | `start`, `end`, `limit` (default 10, max 50) | Array of `{ page_path, page_title, views, unique_visitors }` |
| `GET` | `/api/analytics/events` | `start`, `end` | Array of `{ event_type, event_name, count }` |
| `GET` | `/api/analytics/recent-events` | `page`, `per_page` (5–100), `event_type` | `{ data[], total, per_page, current_page, last_page }` |
| `GET` | `/api/analytics/traffic-sources` | `start`, `end` | Array of `{ source, views, visitors }` |
| `GET` | `/api/analytics/reservation-funnel` | `start`, `end` | Array of `{ step, event_type, visitors }` (4 steps) |

---

## Dashboard

The `/analytics` route requires a login (credentials: `admin` / `admin@123`).

| Widget | Description |
|--------|-------------|
| **KPI Cards** | Page Views · Unique Visitors · Sessions · All Events · Orders |
| **Traffic Over Time** | Daily line chart — views vs unique visitors |
| **Top Pages** | Ranked bar list with relative usage bars |
| **Event Breakdown** | Donut chart — all event types with counts |
| **Traffic Sources** | Horizontal bar — Direct, Google, Instagram, Facebook, Yelp |
| **Reservation Funnel** | 4-step: Page Viewed → Form Started → Time Selected → Completed, with per-step drop-off % |
| **Live Event Feed** | Paginated table (10/15/20/50 per page), filterable by event type, auto-refreshes every 30 s |

**Date filtering:** 7-day / 30-day / 90-day presets plus a custom start–end date picker. All widgets (except the Live Feed) re-query on date change.

---

## Running Tests

```bash
cd backend
php artisan test
```

The test suite uses an in-memory SQLite database — no MySQL setup required.

---

## Key Decisions

### 1. Modular Laravel architecture (`nwidart/laravel-modules`)

The backend is split into two Laravel modules — `Events` (ingestion) and `Analytics` (queries) — rather than one monolithic controller file. This enforces separation of concerns: the ingestion path has no dependency on the analytics query path, and each module owns its own routes, service provider, and repository binding. Adding a third module (e.g., `Alerts`) would not touch existing code.

### 2. Repository pattern

Both modules use `Interface → Repository → ServiceProvider` binding. Controllers depend only on the interface, which means the underlying storage can be swapped (e.g., from MySQL to ClickHouse) without changing any controller or route code.

### 3. Single `events` table

All event types — page views, cart events, reservation steps, server-side business events — are stored in one table with a `properties` JSON column for type-specific data. This avoids a separate schema migration every time a new event type is introduced. Composite indexes on `(event_type, occurred_at)`, `(page_path, occurred_at)`, and `(anonymous_id, occurred_at)` keep the common dashboard queries fast at moderate row counts.

### 4. Client-side batching

The browser SDK accumulates events in memory and sends them in a single `POST` request every 5 seconds (or when 10 events accumulate). This dramatically reduces the number of HTTP requests from high-interaction pages (e.g., a user hovering over 10 menu items generates 10 events but only 1–2 network requests).

### 5. `sendBeacon()` for page-unload delivery

Standard `fetch()` requests are cancelled when the browser navigates away. The SDK uses `navigator.sendBeacon()` on the `visibilitychange: hidden` event, which the browser guarantees to complete even during navigation. A `fetch(..., { keepalive: true })` acts as a fallback for browsers without `sendBeacon`.

### 6. `source` field distinguishing browser vs server events

Both the browser SDK and the PHP `ServerTracker` hit the same `/api/events` endpoint. A `source` field (`browser` | `server`) is set at the SDK level, not by the API, so the pipeline never needs to infer intent from other fields. The dashboard's Live Event Feed displays this as a coloured badge.

### 7. `CONCAT(anonymous_id, '|', session_id)` for session counting

Sessions are counted as distinct `(anonymous_id, session_id)` pairs. A simple `COUNT(DISTINCT session_id)` would overcount if two different visitors happened to generate the same session UUID (unlikely but theoretically possible). Concatenating both with a separator character ensures uniqueness without a join.

### 8. Subquery to fix MySQL `ONLY_FULL_GROUP_BY` on traffic sources

The traffic-sources query normalises raw referrer URLs to human labels (e.g., `https://www.google.com` → `Google`) using a `COALESCE` expression in a subquery. The outer query then groups by the derived alias. Attempting to GROUP BY an alias in the same SELECT clause raises a MySQL `ONLY_FULL_GROUP_BY` error, so the two-level subquery pattern is used throughout the analytics queries.

---

## Assumptions

| Area | Assumption |
|------|-----------|
| **Scale** | The system is designed for a single restaurant at demo/SME scale (thousands to tens of thousands of events per day). |
| **Identity** | Visitors without JavaScript or with `localStorage` blocked are still tracked per-session (the SDK falls back to in-memory UUIDs) but cannot be recognised across sessions. |
| **Timestamps** | Client-supplied `occurred_at` is trusted. In a multi-timezone production system, all timestamps would be normalised to UTC server-side (they are, via `Carbon::parse()`). |
| **Authentication** | The analytics dashboard uses a simple hardcoded token stored in `localStorage`. This is intentional for a demo; it is explicitly called out as a known limitation. |
| **Database** | MySQL 8.0+ is assumed. The `ONLY_FULL_GROUP_BY` mode is enabled by default and is handled in all queries. |
| **CORS** | The Laravel API allows all origins in development. In production, `APP_TRUSTED_ORIGINS` should be restricted to the frontend domain. |
| **No bot filtering** | All events are stored as-is. Crawlers, health checks, and automated tests will appear in the dashboard. |

---

## Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| Single `events` table | No schema changes for new event types; simple joins | `COUNT(DISTINCT ...)` queries slow down past ~10 M rows without partitioning |
| JSON `properties` column | Arbitrary per-event payloads without ALTER TABLE | JSON fields are not indexed; filtering inside properties requires full scans |
| Direct DB write (no queue) | Zero infrastructure dependencies; simple local setup | A traffic spike can exhaust DB connections; no back-pressure mechanism |
| Client-side batching (5 s / 10 events) | Fewer HTTP requests; lower server load | Events can be lost if the tab is force-killed before a flush (sendBeacon mitigates normal navigation) |
| In-memory retry on network failure | Events survive brief outages | Events do not survive page reload or browser crash |
| `nwidart/laravel-modules` v12 (PHP 8.2) | Compatible with the target server's PHP version | v13+ features (PHP 8.3) not available; would need a PHP upgrade to adopt them |
| Recharts for dashboard charts | Mature React charting library; easy to customise | Bundle size (~150 KB gzipped); a lighter option like Chart.js or uPlot would be faster |
| No SSR for analytics page | Chart state is always fresh; no stale cache | Analytics page requires JS; no fallback for no-JS environments |

---

## Known Limitations

1. **No ingestion authentication.** The `POST /api/events` endpoint is open. Anyone who discovers the URL can submit arbitrary events. Production systems should require an API key or HMAC signature per request.

2. **No analytics API authentication.** The `GET /api/analytics/*` endpoints are unauthenticated. The dashboard's login is client-side only and does not protect the raw API. A server-side session or bearer token is needed in production.

3. **No deduplication.** If the client retries a failed batch, duplicate rows are written. An idempotency key per event (e.g., a `client_event_id` column with a unique index) would prevent this.

4. **No geo enrichment.** The `country` column exists in the schema but is never populated. Production would pipe IPs through MaxMind GeoIP2 or a similar service.

5. **No bot or crawler filtering.** User-agent parsing to exclude Googlebot, uptime monitors, and automated CI browser tests is not implemented.

6. **Sessions count is approximate.** The session-counting query (`CONCAT(anonymous_id, '|', session_id)`) is accurate for normal browsing but slightly over-counts if a visitor has multiple tabs open simultaneously (each tab has its own `session_id`).

7. **Single-node MySQL.** At high event volumes (>1 M events/day), `COUNT(DISTINCT ...)` queries become slow. Horizontal scaling would require table partitioning by `occurred_at`, read replicas for analytics queries, or migrating to a columnar store (ClickHouse, BigQuery, Redshift).

8. **No rate limiting on ingestion.** The backend applies Laravel's default throttle middleware (60 req/min globally) but no per-anonymous-ID or per-event-type limits.

9. **Browser SDK — no Node.js / SSR support.** The SDK reads `localStorage`, `sessionStorage`, `navigator`, and `document` directly. It cannot run in a Node.js SSR context (Next.js server components). A separate server-side identity strategy (cookie-based) would be needed for SSR event tracking.

10. **Demo data is optional.** With an empty database all dashboard widgets show "No data". Run `php artisan db:seed` to populate 30 days of realistic events for evaluation purposes.
