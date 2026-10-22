'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  RefreshCw, ChevronLeft, ChevronRight, LogOut, BarChart2,
  Eye, Users, Repeat2, Zap, ShoppingCart, Filter,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated, logout } from '@/lib/auth';
import type {
  OverviewData, PageViewPoint, TopPage, EventBreakdown,
  RecentEvent, PaginatedEvents, TrafficSource, FunnelStep,
} from '@/lib/api';

/* ─── Design tokens ─────────────────────────────────────────────── */

// Categorical palette — 6 hues, fixed order, Tailwind-500 tier
const CAT = ['#f59e0b', '#3b82f6', '#14b8a6', '#8b5cf6', '#f43f5e', '#64748b'];
const FUNNEL_COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#8b5cf6'];

const PRESETS = [
  { label: '7d',  days: 7  },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const EVENT_TYPES = [
  { value: '',                           label: 'All Events'                },
  { value: 'page_view',                  label: 'Page View'                 },
  { value: 'menu_item_viewed',           label: 'Menu Item Viewed'          },
  { value: 'add_to_cart',               label: 'Add to Cart'               },
  { value: 'order_created',             label: 'Order Created'             },
  { value: 'reservation_page_viewed',   label: 'Reservation Page Viewed'   },
  { value: 'reservation_form_started',  label: 'Reservation Form Started'  },
  { value: 'reservation_time_selected', label: 'Reservation Time Selected' },
  { value: 'reservation_completed',     label: 'Reservation Completed'     },
];

/* ─── Helpers ──────────────────────────────────────────────────── */

function dateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  return d.toISOString().slice(0, 10);
}
function today() { return new Date().toISOString().slice(0, 10); }

function eventBadge(type: string) {
  const map: Record<string, string> = {
    page_view:                    'bg-blue-50 text-blue-700',
    menu_item_viewed:             'bg-stone-100 text-stone-600',
    add_to_cart:                  'bg-amber-50 text-amber-700',
    order_created:                'bg-emerald-50 text-emerald-700',
    reservation_page_viewed:      'bg-indigo-50 text-indigo-700',
    reservation_form_started:     'bg-sky-50 text-sky-700',
    reservation_time_selected:    'bg-cyan-50 text-cyan-700',
    reservation_completed:        'bg-violet-50 text-violet-700',
    order_confirmed:              'bg-teal-50 text-teal-700',
    reservation_confirmed:        'bg-purple-50 text-purple-700',
    payment_processed:            'bg-rose-50 text-rose-700',
  };
  return map[type] ?? 'bg-stone-100 text-stone-600';
}

/* ─── Shared UI primitives ─────────────────────────────────────── */

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-stone-300" />
      </div>
      <p className="text-sm text-stone-400 font-medium">{message}</p>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[6.5rem]" />)}
      </div>
      <Skeleton className="h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-52" />
      <Skeleton className="h-72" />
      <Skeleton className="h-96" />
    </div>
  );
}

interface TooltipEntry { name?: string; value?: number; color?: string }
interface TooltipArgs  { active?: boolean; payload?: TooltipEntry[]; label?: string }
function ChartTooltip({ active, payload, label }: TooltipArgs) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-150 rounded-xl px-4 py-3 shadow-xl text-sm"
      style={{ borderColor: '#e7e5e4' }}>
      {label && <p className="text-stone-400 text-xs font-medium mb-2">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-stone-600">{p.name}:</span>
          <span className="font-bold text-stone-900 tabular-nums">{(p.value ?? 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

interface KpiCardProps {
  label: string; value: number;
  Icon: React.ElementType;
  accent: string; iconBg: string; iconColor: string;
}
function KpiCard({ label, value, Icon, accent, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-stone-100 px-5 pt-5 pb-4 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* colored top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-3 mt-1">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate leading-4">{label}</p>
          <p className="text-[1.65rem] font-bold text-stone-900 mt-1 tabular-nums leading-tight">{value.toLocaleString()}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} group-hover:scale-105 transition-transform duration-200`}>
          <Icon className={`w-[1.1rem] h-[1.1rem] ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────── */

export default function AnalyticsDashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/analytics/login');
  }, [router]);

  /* Date range */
  const [preset, setPreset] = useState(30);
  const [start,  setStart]  = useState(() => dateOffset(30));
  const [end,    setEnd]    = useState(today);

  /* API data */
  const [overview,  setOverview]  = useState<OverviewData | null>(null);
  const [pvSeries,  setPvSeries]  = useState<PageViewPoint[]>([]);
  const [topPages,  setTopPages]  = useState<TopPage[]>([]);
  const [evBreak,   setEvBreak]   = useState<EventBreakdown[]>([]);
  const [sources,   setSources]   = useState<TrafficSource[]>([]);
  const [funnel,    setFunnel]    = useState<FunnelStep[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  /* Live feed */
  const [feed,        setFeed]        = useState<PaginatedEvents | null>(null);
  const [feedPage,    setFeedPage]    = useState(1);
  const [feedPerPage, setFeedPerPage] = useState(15);
  const [feedFilter,  setFeedFilter]  = useState('');
  const [feedLoading, setFeedLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setError('');
    try {
      const p = { start, end };
      const [ov, pv, tp, ev, sr, fn] = await Promise.all([
        api.overview(p), api.pageViews(p), api.topPages(p),
        api.events(p),   api.trafficSources(p), api.reservationFunnel(p),
      ]);
      setOverview(ov); setPvSeries(pv); setTopPages(tp);
      setEvBreak(ev);  setSources(sr);  setFunnel(fn);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load — is the API running?');
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  const loadFeed = useCallback(async (page = feedPage, filter = feedFilter, perPage = feedPerPage) => {
    if (!isAuthenticated()) return;
    setFeedLoading(true);
    try {
      const result = await api.recentEvents({ page, per_page: perPage, event_type: filter || undefined });
      setFeed(result);
      setLastRefresh(new Date());
    } catch {}
    finally { setFeedLoading(false); }
  }, [feedPage, feedFilter, feedPerPage]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadFeed(feedPage, feedFilter, feedPerPage); }, [feedPage, feedFilter, feedPerPage]); // eslint-disable-line

  useEffect(() => {
    const id = setInterval(() => loadFeed(feedPage, feedFilter, feedPerPage), 30_000);
    return () => clearInterval(id);
  }, [loadFeed, feedPage, feedFilter, feedPerPage]);

  function applyPreset(days: number) {
    setPreset(days);
    setStart(dateOffset(days));
    setEnd(today());
  }
  function handleFilterChange(val: string) { setFeedFilter(val); setFeedPage(1); }
  function handlePerPageChange(val: number) { setFeedPerPage(val); setFeedPage(1); }

  const pvMax       = topPages[0]?.views ?? 1;
  const totalPages  = feed?.last_page ?? 1;
  const currentPage = feed?.current_page ?? 1;
  const totalRows   = feed?.total ?? 0;

  function paginationPages(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (currentPage >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages];
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-stone-950 border-b border-stone-800/50 px-4 md:px-6 h-14 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-shadow">
              <BarChart2 className="w-4 h-4 text-stone-950" />
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block tracking-tight">Bistro Table</span>
          </Link>
          <span className="text-stone-700 hidden sm:block select-none">·</span>
          <span className="text-stone-400 text-sm hidden sm:block">Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"
            className="text-xs text-stone-500 hover:text-stone-200 transition-colors hidden sm:flex items-center gap-1 px-3 py-1.5 hover:bg-stone-800/70 rounded-lg">
            ← Live Site
          </Link>
          <button
            onClick={() => { logout(); router.replace('/analytics/login'); }}
            className="flex items-center gap-1.5 text-xs bg-stone-800/80 hover:bg-stone-700 border border-stone-700/60 text-stone-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ── Page heading + date controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
            <p className="text-stone-400 text-xs mt-0.5 tabular-nums">
              {start} — {end}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preset pill group */}
            <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 gap-0.5 shadow-sm">
              {PRESETS.map((p) => (
                <button key={p.days} onClick={() => applyPreset(p.days)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    preset === p.days
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            <input type="date" value={start}
              onChange={(e) => { setStart(e.target.value); setPreset(0); }}
              className="border border-stone-200 bg-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 shadow-sm" />
            <span className="text-stone-300 text-xs select-none">–</span>
            <input type="date" value={end}
              onChange={(e) => { setEnd(e.target.value); setPreset(0); }}
              className="border border-stone-200 bg-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 shadow-sm" />

            <button onClick={load}
              className="bg-stone-900 text-white text-xs font-semibold px-4 py-1.5 rounded-xl hover:bg-amber-500 hover:text-stone-950 transition-colors shadow-sm">
              Apply
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl text-sm">
            <span className="text-lg shrink-0 leading-5">⚠</span>
            <div>
              <p className="font-semibold">Could not load data</p>
              <p className="text-red-400 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Content: skeleton while loading, otherwise charts ── */}
        {loading ? <SkeletonDashboard /> : (
          <>
            {/* ── KPI row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard label="Page Views"      value={overview?.page_views      ?? 0} Icon={Eye}          accent="#f59e0b" iconBg="bg-amber-50"   iconColor="text-amber-500" />
              <KpiCard label="Unique Visitors" value={overview?.unique_visitors ?? 0} Icon={Users}        accent="#3b82f6" iconBg="bg-blue-50"    iconColor="text-blue-500" />
              <KpiCard label="Sessions"        value={overview?.sessions        ?? 0} Icon={Repeat2}      accent="#14b8a6" iconBg="bg-teal-50"    iconColor="text-teal-500" />
              <KpiCard label="All Events"      value={overview?.total_events    ?? 0} Icon={Zap}          accent="#8b5cf6" iconBg="bg-violet-50"  iconColor="text-violet-500" />
              <KpiCard label="Orders"          value={overview?.orders          ?? 0} Icon={ShoppingCart} accent="#10b981" iconBg="bg-emerald-50" iconColor="text-emerald-500" />
            </div>

            {/* ── Traffic over time (area chart) ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                  <h2 className="font-bold text-stone-900">Traffic Over Time</h2>
                  <p className="text-stone-400 text-xs mt-0.5">Daily page views and unique visitors</p>
                </div>
                {pvSeries.length > 0 && (
                  <div className="flex items-center gap-5 text-xs text-stone-500 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-[2.5px] rounded-full inline-block bg-amber-500" />
                      Page Views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-[2px] rounded-full inline-block bg-blue-400 opacity-70"
                        style={{ backgroundImage: 'repeating-linear-gradient(to right,#3b82f6 0,#3b82f6 4px,transparent 4px,transparent 7px)' }} />
                      Visitors
                    </span>
                  </div>
                )}
              </div>
              {pvSeries.length === 0 ? (
                <EmptyState message="No traffic data for this range" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={pvSeries} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2f0ec" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false}
                      tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} width={32} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e7e5e4', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="views"           name="Page Views"      stroke="#f59e0b" fill="url(#gViews)"    strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke="#3b82f6" fill="url(#gVisitors)" strokeWidth={2}   dot={false} strokeDasharray="5 3" activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Top pages + Event donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top pages */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 mb-0.5">Top Pages</h2>
                <p className="text-stone-400 text-xs mb-6">Most visited in the selected period</p>
                {topPages.length === 0 ? <EmptyState message="No page data" /> : (
                  <div className="space-y-4">
                    {topPages.slice(0, 7).map((p, i) => (
                      <div key={p.page_path}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] text-stone-300 font-mono w-4 shrink-0 text-right">{i + 1}</span>
                            <span className="font-mono text-stone-700 truncate text-xs">{p.page_path}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-[11px] text-stone-400 tabular-nums">{p.unique_visitors.toLocaleString()}&nbsp;uniq</span>
                            <span className="font-bold text-stone-900 text-sm tabular-nums">{p.views.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(p.views / pvMax) * 100}%`, background: CAT[i % CAT.length] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Event breakdown donut */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 mb-0.5">Event Breakdown</h2>
                <p className="text-stone-400 text-xs mb-6">All tracked event types</p>
                {evBreak.length === 0 ? <EmptyState message="No event data" /> : (
                  <div className="flex items-center gap-6">
                    <div className="shrink-0">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={evBreak.slice(0, 6)} dataKey="count" nameKey="event_name"
                            cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                            paddingAngle={2} startAngle={90} endAngle={-270}>
                            {evBreak.slice(0, 6).map((_, i) => (
                              <Cell key={i} fill={CAT[i % CAT.length]} stroke="white" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2.5 min-w-0">
                      {evBreak.slice(0, 6).map((e, i) => (
                        <div key={e.event_type} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: CAT[i % CAT.length] }} />
                          <span className="text-xs text-stone-600 truncate flex-1">{e.event_name}</span>
                          <span className="text-xs font-bold text-stone-900 tabular-nums">{e.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Traffic sources ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 mb-0.5">Traffic Sources</h2>
              <p className="text-stone-400 text-xs mb-6">Where visitors arrive from</p>
              {sources.length === 0 ? <EmptyState message="No source data" /> : (
                <ResponsiveContainer width="100%" height={Math.max(sources.length * 40, 120)}>
                  <BarChart data={sources} layout="vertical" margin={{ left: 110, right: 24, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2f0ec" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="source" width={110}
                      tick={{ fontSize: 11, fill: '#78716c' }} tickLine={false} axisLine={false}
                      tickFormatter={(v: string) => v.length > 28 ? v.slice(0, 26) + '…' : v} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#faf9f7' }} />
                    <Bar dataKey="views" name="Page Views" fill={CAT[0]} radius={[0, 6, 6, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Reservation funnel ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 mb-0.5">Reservation Funnel</h2>
              <p className="text-stone-400 text-xs mb-8">Visitor drop-off through the booking journey</p>
              {funnel.length === 0 ? <EmptyState message="No funnel data" /> : (
                <div className="space-y-1 max-w-2xl mx-auto">
                  {funnel.map((step, i) => {
                    const topVal  = funnel[0].visitors || 1;
                    const pct     = Math.round((step.visitors / topVal) * 100);
                    const dropPct = i > 0
                      ? Math.round(((funnel[i - 1].visitors - step.visitors) / (funnel[i - 1].visitors || 1)) * 100)
                      : null;
                    return (
                      <div key={step.step}>
                        {dropPct !== null && (
                          <div className="flex items-center gap-3 py-2.5">
                            <div className="h-px flex-1 bg-stone-100" />
                            <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                              ↓ {dropPct}% drop-off
                            </span>
                            <div className="h-px flex-1 bg-stone-100" />
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="w-36 text-right shrink-0">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Step {i + 1}</p>
                            <p className="text-xs font-semibold text-stone-600 mt-0.5 leading-tight">{step.step}</p>
                            <p className="text-2xl font-bold text-stone-900 tabular-nums">{step.visitors.toLocaleString()}</p>
                          </div>
                          <div className="flex-1 flex">
                            <div
                              className="h-[3.25rem] rounded-xl flex items-center justify-end pr-4 transition-all duration-700"
                              style={{
                                width: `${Math.max(pct, 8)}%`,
                                background: `linear-gradient(135deg, ${FUNNEL_COLORS[i]}cc, ${FUNNEL_COLORS[i]})`,
                                minWidth: '3.5rem',
                              }}
                            >
                              <span className="text-white text-sm font-bold">{pct}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Live event feed ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

              {/* Feed header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-stone-100">
                <div>
                  <h2 className="font-bold text-stone-900 flex items-center gap-2">
                    Live Event Feed
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      30s refresh
                    </span>
                  </h2>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {lastRefresh
                      ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      : 'All events across browser and server'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
                    <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <select value={feedFilter} onChange={(e) => handleFilterChange(e.target.value)}
                      className="bg-transparent text-xs text-stone-700 focus:outline-none cursor-pointer pr-1 min-w-0">
                      {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <select value={feedPerPage} onChange={(e) => handlePerPageChange(Number(e.target.value))}
                    className="border border-stone-200 bg-stone-50 rounded-lg px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {[10, 15, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
                  </select>

                  <button onClick={() => loadFeed(feedPage, feedFilter, feedPerPage)} disabled={feedLoading}
                    className="flex items-center gap-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${feedLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {feedLoading && !feed ? (
                  <div className="p-6 space-y-2.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-11 rounded-lg" />
                    ))}
                  </div>
                ) : feed?.data.length === 0 ? (
                  <div className="py-4 text-center">
                    <EmptyState message={feedFilter ? `No "${feedFilter}" events in range` : 'No events yet'} />
                    {feedFilter && (
                      <button onClick={() => handleFilterChange('')}
                        className="mt-1 text-xs text-amber-600 hover:text-amber-500 underline transition-colors">
                        Clear filter
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-stone-50/80 border-b border-stone-100 sticky top-14">
                      <tr>
                        {['#', 'Time', 'Event', 'Page', 'Visitor', 'Source'].map((h) => (
                          <th key={h}
                            className="text-left text-[10px] font-bold text-stone-400 px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-stone-50 transition-opacity duration-150 ${feedLoading ? 'opacity-40' : 'opacity-100'}`}>
                      {(feed?.data ?? []).map((ev: RecentEvent, idx: number) => {
                        const rowNum = ((currentPage - 1) * feedPerPage) + idx + 1;
                        return (
                          <tr key={ev.id} className="hover:bg-amber-50/50 transition-colors">
                            <td className="px-4 py-3 text-xs text-stone-300 font-mono w-10 tabular-nums">{rowNum}</td>
                            <td className="px-4 py-3 text-stone-400 whitespace-nowrap text-xs tabular-nums">
                              {new Date(ev.occurred_at).toLocaleString([], {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${eventBadge(ev.event_type)}`}>
                                {ev.event_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-stone-500 text-xs">{ev.page_path ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-mono text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded">
                                {(ev.anonymous_id ?? '').slice(0, 8)}…
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                ev.source === 'server'
                                  ? 'bg-violet-50 text-violet-700'
                                  : 'bg-stone-100 text-stone-500'
                              }`}>
                                {ev.source}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination footer */}
              {feed && feed.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
                  <p className="text-xs text-stone-400">
                    Showing{' '}
                    <span className="font-semibold text-stone-700">
                      {((currentPage - 1) * feedPerPage) + 1}–{Math.min(currentPage * feedPerPage, totalRows)}
                    </span>
                    {' '}of{' '}
                    <span className="font-semibold text-stone-700">{totalRows.toLocaleString()}</span>
                    {' '}events
                    {feedFilter && (
                      <button onClick={() => handleFilterChange('')}
                        className="ml-2 text-amber-600 hover:text-amber-500 underline transition-colors">
                        clear filter
                      </button>
                    )}
                  </p>

                  <div className="flex items-center gap-1">
                    <button onClick={() => setFeedPage(1)} disabled={currentPage === 1}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white border border-transparent hover:border-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFeedPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white border border-transparent hover:border-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {paginationPages().map((pg, i) =>
                      pg === '…' ? (
                        <span key={`el-${i}`} className="w-8 text-center text-stone-300 text-xs select-none">…</span>
                      ) : (
                        <button key={pg} onClick={() => setFeedPage(pg as number)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                            pg === currentPage
                              ? 'bg-amber-500 text-stone-950 shadow-sm'
                              : 'text-stone-500 hover:bg-white hover:text-stone-800 border border-transparent hover:border-stone-200'
                          }`}>
                          {pg}
                        </button>
                      )
                    )}

                    <button onClick={() => setFeedPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white border border-transparent hover:border-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFeedPage(totalPages)} disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white border border-transparent hover:border-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white px-6 py-4 mt-2">
        <p className="text-xs text-stone-400 text-center">Bistro Table Analytics · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
