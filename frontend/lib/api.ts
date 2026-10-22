const BASE     = process.env.NEXT_PUBLIC_API_URL;
const READ_KEY = process.env.NEXT_PUBLIC_ANALYTICS_READ_KEY ?? '';

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (READ_KEY) headers['Authorization'] = `Bearer ${READ_KEY}`;

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) {
    let msg = `API error ${res.status}: ${path}`;
    try {
      const body = await res.json();
      if (body.message) msg = body.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export interface OverviewData {
  page_views: number;
  unique_visitors: number;
  sessions: number;
  total_events: number;
  orders: number;
  start: string;
  end: string;
}

export interface PageViewPoint {
  date: string;
  views: number;
  unique_visitors: number;
}

export interface TopPage {
  page_path: string;
  page_title: string;
  views: number;
  unique_visitors: number;
}

export interface EventBreakdown {
  event_type: string;
  event_name: string;
  count: number;
}

export interface RecentEvent {
  id: number;
  event_type: string;
  event_name: string;
  page_path: string;
  anonymous_id: string;
  source: string;
  occurred_at: string;
}

export interface PaginatedEvents {
  data: RecentEvent[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface TrafficSource {
  source: string;
  views: number;
  visitors: number;
}

export interface FunnelStep {
  step: string;
  event_type: string;
  visitors: number;
}

type DateParams = { start?: string; end?: string };

export const api = {
  overview:          (p?: DateParams) => get<OverviewData>('/analytics/overview', p as any),
  pageViews:         (p?: DateParams) => get<PageViewPoint[]>('/analytics/page-views', p as any),
  topPages:          (p?: DateParams) => get<TopPage[]>('/analytics/top-pages', p as any),
  events:            (p?: DateParams) => get<EventBreakdown[]>('/analytics/events', p as any),
  recentEvents: (p?: { page?: number; per_page?: number; event_type?: string }) =>
    get<PaginatedEvents>('/analytics/recent-events', {
      ...(p?.page      ? { page:       String(p.page)      } : {}),
      ...(p?.per_page  ? { per_page:   String(p.per_page)  } : {}),
      ...(p?.event_type ? { event_type: p.event_type }       : {}),
    }),
  trafficSources:    (p?: DateParams) => get<TrafficSource[]>('/analytics/traffic-sources', p as any),
  reservationFunnel: (p?: DateParams) => get<FunnelStep[]>('/analytics/reservation-funnel', p as any),
};
