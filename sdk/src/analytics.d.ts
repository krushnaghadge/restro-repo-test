/**
 * Restro Analytics Browser SDK — TypeScript declarations
 */

export interface DeviceContext {
  ua: string;
  language: string;
  timezone: string;
  screen: string;
  referrer: string;
}

export interface EventPayload {
  anonymous_id: string;
  session_id: string;
  user_id: string | null;
  event_type: string;
  event_name: string;
  page_path: string;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  source: 'browser';
  properties?: Record<string, unknown>;
  device: DeviceContext;
  occurred_at: string;
}

declare class AnalyticsSDK {
  /**
   * @param endpoint  Full URL of the ingestion API, e.g. "https://api.example.com/api/events"
   */
  constructor(endpoint: string);

  /**
   * Associate subsequent events with an authenticated user.
   * Call this after a successful login.
   */
  identify(userId: string): void;

  /**
   * Clear the user identity. Call after logout.
   */
  reset(): void;

  /**
   * Track a page view manually.
   * If arguments are omitted, values are read from `window.location` and `document`.
   */
  page(path?: string, title?: string, url?: string): void;

  /**
   * Track a custom event.
   *
   * @param eventType   Snake-case identifier, e.g. "add_to_cart"
   * @param eventName   Human-readable label, e.g. "Add to Cart"
   * @param properties  Arbitrary JSON-serialisable payload
   *
   * @example
   * analytics.track('add_to_cart', 'Add to Cart', { item: 'Tiramisu', price: 10 });
   */
  track(eventType: string, eventName: string, properties?: Record<string, unknown>): void;

  /**
   * Enable automatic page-view tracking for single-page applications.
   *
   * - Fires one `page_view` immediately for the current route.
   * - Patches `history.pushState` to fire on every client-side navigation.
   * - Listens for `popstate` (back/forward buttons).
   *
   * Call this once on SDK initialisation.
   */
  autoPage(): void;
}

export default AnalyticsSDK;

// Global augmentation for plain <script> usage
declare global {
  interface Window {
    AnalyticsSDK: typeof AnalyticsSDK;
    /** Convenience reference set by AnalyticsProvider */
    __analytics?: AnalyticsSDK;
  }
}
