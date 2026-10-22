/**
 * Restro Analytics Browser SDK
 *
 * Zero-dependency, < 3 KB minified.
 * Tracks page views automatically and exposes `track()` for custom events.
 *
 * Identity model:
 *   anonymous_id  — UUID stored in localStorage, survives across sessions
 *   session_id    — UUID stored in sessionStorage, resets on tab close
 *   user_id       — set explicitly via identify(), optional
 *
 * Delivery:
 *   Events are queued in memory and flushed every 5 s or when the queue
 *   reaches 10 events, whichever comes first.  On page-hide we do a
 *   synchronous sendBeacon() flush so nothing is lost when the user
 *   navigates away.
 */

const ANON_KEY    = '_ra_anon';
const SESSION_KEY = '_ra_sess';
const QUEUE_SIZE  = 10;
const FLUSH_INTERVAL_MS = 5000;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreate(storage, key) {
  try {
    let v = storage.getItem(key);
    if (!v) { v = uuid(); storage.setItem(key, v); }
    return v;
  } catch {
    return uuid(); // private-mode / blocked storage — still works, just loses persistence
  }
}

function deviceContext() {
  return {
    ua:       navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen:   `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer || '',
  };
}

class AnalyticsSDK {
  #endpoint;
  #writeKey;
  #queue   = [];
  #timer   = null;
  #userId  = null;
  #anonId;
  #sessId;
  #device;

  constructor(endpoint, writeKey = '') {
    this.#endpoint = endpoint;
    this.#writeKey = writeKey;
    this.#anonId   = getOrCreate(localStorage,   ANON_KEY);
    this.#sessId   = getOrCreate(sessionStorage,  SESSION_KEY);
    this.#device   = deviceContext();

    // Flush on visibility change (tab close / navigation)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.#flushBeacon();
    });

    this.#startTimer();
  }

  /** Set an authenticated user identity. Call after login. */
  identify(userId) {
    this.#userId = String(userId);
  }

  /** Clear user identity. Call after logout. */
  reset() {
    this.#userId = null;
  }

  /** Track a page view. Called automatically by autoPage(). */
  page(path, title, url) {
    this.#enqueue({
      event_type: 'page_view',
      event_name: 'Page View',
      page_path:  path  ?? location.pathname,
      page_title: title ?? document.title,
      page_url:   url   ?? location.href,
      referrer:   document.referrer || '',
    });
  }

  /**
   * Track a custom event.
   * @param {string} eventType  - snake_case identifier, e.g. "add_to_cart"
   * @param {string} eventName  - human label, e.g. "Add to Cart"
   * @param {object} properties - arbitrary payload
   */
  track(eventType, eventName, properties = {}) {
    this.#enqueue({
      event_type:  eventType,
      event_name:  eventName,
      page_path:   location.pathname,
      page_url:    location.href,
      properties,
    });
  }

  /** Wire up automatic page-view tracking for SPAs using the History API. */
  autoPage() {
    this.page();

    const orig = history.pushState.bind(history);
    history.pushState = (...args) => {
      orig(...args);
      setTimeout(() => this.page(), 0);
    };

    window.addEventListener('popstate', () => this.page());
  }

  // ── private ───────────────────────────────────────────────────────────────

  #enqueue(partial) {
    const event = {
      anonymous_id: this.#anonId,
      session_id:   this.#sessId,
      user_id:      this.#userId,
      source:       'browser',
      device:       this.#device,
      occurred_at:  new Date().toISOString(),
      ...partial,
    };

    this.#queue.push(event);

    if (this.#queue.length >= QUEUE_SIZE) {
      this.#flush();
    }
  }

  #flush() {
    if (!this.#queue.length) return;
    const batch = this.#queue.splice(0);

    const headers = { 'Content-Type': 'application/json' };
    if (this.#writeKey) headers['X-Analytics-Key'] = this.#writeKey;

    fetch(this.#endpoint, {
      method:  'POST',
      headers,
      body:    JSON.stringify(batch),
      // keepalive lets the request survive tab close in modern browsers
      keepalive: true,
    }).catch(() => {
      // On network failure, push events back to the front of the queue
      // to be retried on the next flush.  Discard if queue is too large
      // to avoid unbounded memory growth.
      if (this.#queue.length < 200) {
        this.#queue.unshift(...batch);
      }
    });
  }

  #flushBeacon() {
    if (!this.#queue.length) return;
    const batch = this.#queue.splice(0);

    // sendBeacon is fire-and-forget but guaranteed to complete even on page unload.
    // sendBeacon cannot set custom headers, so the write key goes in the URL query string.
    if (navigator.sendBeacon) {
      const url  = this.#writeKey ? `${this.#endpoint}?key=${encodeURIComponent(this.#writeKey)}` : this.#endpoint;
      const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    }
  }

  #startTimer() {
    this.#timer = setInterval(() => this.#flush(), FLUSH_INTERVAL_MS);
    // Don't keep the event loop alive when the page is otherwise idle
    if (this.#timer.unref) this.#timer.unref();
  }
}

// Export for both ESM (Next.js) and plain <script> usage
export default AnalyticsSDK;

// UMD/global fallback for plain <script src="..."> usage
if (typeof window !== 'undefined') {
  window.AnalyticsSDK = AnalyticsSDK;
}
