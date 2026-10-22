import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Bistro Table – Fine Dining Restaurant',
  description:
    'Farm-to-table fine dining in the heart of the city. Book your table, explore our seasonal menu, and experience evenings worth remembering.',
};

const CATEGORIES = [
  { icon: '🥗', label: 'Starters',       href: '/menu?tab=Starters',     sub: '3 dishes'   },
  { icon: '🍖', label: 'Main Course',    href: '/menu?tab=Main+Course',  sub: '4 dishes'   },
  { icon: '🍰', label: 'Desserts',       href: '/menu?tab=Desserts',     sub: '3 dishes'   },
  { icon: '🍷', label: 'Wine & Drinks',  href: '/menu?tab=Wine+%26+Drinks',  sub: '80+ labels' },
  { icon: '🥂', label: "Chef's Special", href: "/menu?tab=Chef%27s+Special", sub: 'Limited'    },
  { icon: '🎂', label: 'Private Events', href: '/reservations',          sub: 'Book now'   },
];

const DISHES = [
  {
    name: 'Burrata & Heirloom Tomatoes',
    category: 'Starter', price: 14, tag: "Chef's Pick",
    rating: 4.8, votes: 124, emoji: '🥗',
    from: 'from-emerald-900', to: 'to-teal-950',
  },
  {
    name: 'Braised Short Rib',
    category: 'Main', price: 34, tag: 'Signature',
    rating: 4.9, votes: 287, emoji: '🍖',
    from: 'from-red-950', to: 'to-rose-900',
  },
  {
    name: 'Grilled Atlantic Salmon',
    category: 'Main', price: 28, tag: 'Seasonal',
    rating: 4.7, votes: 198, emoji: '🐟',
    from: 'from-blue-950', to: 'to-cyan-900',
  },
  {
    name: 'Pasta Carbonara',
    category: 'Main', price: 22, tag: 'Bestseller',
    rating: 4.8, votes: 341, emoji: '🍝',
    from: 'from-amber-950', to: 'to-yellow-950',
  },
  {
    name: 'Tiramisu',
    category: 'Dessert', price: 10, tag: 'Classic',
    rating: 4.9, votes: 156, emoji: '🍮',
    from: 'from-stone-800', to: 'to-amber-950',
  },
  {
    name: 'Crème Brûlée',
    category: 'Dessert', price: 9, tag: 'Popular',
    rating: 4.7, votes: 89, emoji: '🍯',
    from: 'from-orange-950', to: 'to-amber-900',
  },
];

const OFFERS = [
  {
    icon: '🎉', color: 'bg-rose-50 border-rose-200',
    badge: 'bg-rose-500',
    title: 'First Visit Offer',
    desc: '20% off your entire bill on your first dine-in experience.',
    code: 'BISTRO20', valid: 'Valid any day of the week',
  },
  {
    icon: '👨‍👩‍👧‍👦', color: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-600',
    title: 'Table for 4+',
    desc: 'Complimentary dessert platter for groups of four or more.',
    code: 'GROUP4', valid: 'Monday – Thursday only',
  },
  {
    icon: '💍', color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-500',
    title: 'Anniversary Package',
    desc: 'Sparkling wine + personalised dessert on your special day.',
    code: 'ANNIV', valid: 'Mention while booking',
  },
];

const REVIEWS = [
  {
    name: 'Sarah K.', avatar: '👩', stars: 5, date: '2 weeks ago',
    quote: 'An unforgettable evening — the short rib melted on the tongue. The sommelier walked us through every pairing with genuine passion.',
    helpful: 24, tag: 'Dined in · Dinner',
  },
  {
    name: 'James R.', avatar: '👨', stars: 5, date: '1 month ago',
    quote: "The wine pairing was perfection. Came for date night, left already planning our next visit. The burrata is life-changing.",
    helpful: 31, tag: 'Dined in · Date Night',
  },
  {
    name: 'Priya M.', avatar: '🧑', stars: 5, date: '3 weeks ago',
    quote: 'Perfect for our anniversary. The staff made every detail feel personal. Carbonara was the best I\'ve had outside of Rome.',
    helpful: 18, tag: 'Dined in · Anniversary',
  },
];


const TAG_COLORS: Record<string, string> = {
  "Chef's Pick": 'bg-emerald-100 text-emerald-700',
  Signature:     'bg-rose-100 text-rose-700',
  Seasonal:      'bg-sky-100 text-sky-700',
  Bestseller:    'bg-amber-100 text-amber-700',
  Classic:       'bg-stone-100 text-stone-600',
  Popular:       'bg-violet-100 text-violet-700',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">

      <Navbar />

      {/* Hero — two-column layout fills viewport without blank space */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(217,119,6,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(120,53,15,0.2)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)] items-center gap-8 lg:gap-16 py-14 lg:py-0">

            {/* Left — copy */}
            <div className="flex flex-col items-start gap-5">

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Now
                </span>
                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">
                  ✦ Fine Dining · Est. 2018
                </span>
                <span className="bg-white/10 border border-white/20 text-stone-300 text-xs font-semibold px-3 py-1 rounded-full">
                  📍 Downtown · 0.8 mi
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.05]">
                Where Every<br />
                <span className="text-amber-400">Meal Becomes</span><br />
                a Memory
              </h1>

              {/* Cuisine tags */}
              <div className="flex flex-wrap gap-2">
                {['Italian', 'Continental', 'Seasonal', 'Farm-to-Table'].map((t) => (
                  <span key={t} className="text-stone-400 text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-amber-500 text-stone-900 font-bold text-sm px-3 py-1.5 rounded-lg">
                  <span>★</span><span>4.9</span>
                </div>
                <span className="text-stone-400 text-sm">2,300+ reviews</span>
                <span className="text-stone-600">·</span>
                <span className="text-stone-400 text-sm">$60–90 for two</span>
                <span className="text-stone-600">·</span>
                <span className="text-stone-400 text-sm">Dine-in &amp; Takeaway</span>
              </div>

              {/* Quick booking */}
              <div className="w-full max-w-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <p className="text-stone-300 text-sm font-medium mb-3">Reserve a table — it takes 30 seconds</p>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-left">
                    <p className="text-stone-400 text-xs mb-0.5">When</p>
                    <p className="text-white font-semibold text-sm">Tonight · 7 PM</p>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-left">
                    <p className="text-stone-400 text-xs mb-0.5">Guests</p>
                    <p className="text-white font-semibold text-sm">2 People</p>
                  </div>
                  <Link href="/reservations"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm px-3 py-2.5 rounded-xl transition-all hover:scale-105 flex items-center justify-center text-center leading-tight">
                    Check →
                  </Link>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link href="/menu"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all">
                  🍽 View Full Menu
                </Link>
                <Link href="/about"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all">
                  👨‍🍳 Meet the Chef
                </Link>
                <Link href="/analytics"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-amber-500/30 text-amber-400 font-medium text-sm px-5 py-2.5 rounded-xl transition-all">
                  📊 Analytics
                </Link>
              </div>
            </div>

            {/* Right — dish showcase (desktop only) */}
            <div className="hidden lg:flex flex-col gap-3 py-10">

              {/* Featured large card */}
              <div className="bg-gradient-to-br from-red-950 to-rose-900 rounded-2xl p-5 flex items-center gap-5 border border-white/5 hover:border-amber-500/20 transition-all group cursor-pointer">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300 shrink-0">🍖</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">Signature</span>
                    <span className="w-1 h-1 rounded-full bg-stone-600" />
                    <span className="text-xs text-stone-500">Main Course</span>
                  </div>
                  <h3 className="text-white font-bold text-xl leading-tight">Braised Short Rib</h3>
                  <p className="text-stone-400 text-sm mt-0.5">12-hour braised, creamy polenta, gremolata</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-amber-400 text-sm font-bold">★ 4.9</span>
                    <span className="text-stone-500 text-xs">287 reviews</span>
                    <span className="ml-auto text-white font-bold text-lg">$34</span>
                  </div>
                </div>
              </div>

              {/* Two medium cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-4 border border-white/5 hover:border-amber-500/20 transition-all group cursor-pointer">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">🥗</span>
                  <h3 className="text-white font-bold text-base mt-2 leading-tight">Burrata &amp; Heirlooms</h3>
                  <p className="text-stone-400 text-xs mt-0.5">Fresh basil oil, ripe tomatoes</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-amber-400 text-xs font-bold">★ 4.8</span>
                    <span className="text-white font-bold">$14</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-950 to-yellow-950 rounded-2xl p-4 border border-white/5 hover:border-amber-500/20 transition-all group cursor-pointer">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">🍝</span>
                  <h3 className="text-white font-bold text-base mt-2 leading-tight">Pasta Carbonara</h3>
                  <p className="text-stone-400 text-xs mt-0.5">Hand-rolled, aged pecorino</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-amber-400 text-xs font-bold">★ 4.8</span>
                    <span className="text-white font-bold">$22</span>
                  </div>
                </div>
              </div>

              {/* Three small tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-stone-800 to-amber-950 rounded-xl p-3.5 text-center border border-white/5 hover:border-amber-500/20 transition-all group cursor-pointer">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block">🍮</span>
                  <p className="text-white text-xs font-semibold mt-1.5">Tiramisu</p>
                  <p className="text-amber-400 text-xs mt-0.5">★ 4.9</p>
                </div>
                <div className="bg-gradient-to-br from-blue-950 to-cyan-900 rounded-xl p-3.5 text-center border border-white/5 hover:border-amber-500/20 transition-all group cursor-pointer">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block">🐟</span>
                  <p className="text-white text-xs font-semibold mt-1.5">Salmon</p>
                  <p className="text-amber-400 text-xs mt-0.5">★ 4.7</p>
                </div>
                <div className="bg-gradient-to-br from-purple-950 to-violet-900 rounded-xl p-3.5 text-center border border-white/5 hover:border-amber-500/20 transition-all group cursor-pointer">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block">🍷</span>
                  <p className="text-white text-xs font-semibold mt-1.5">Wine List</p>
                  <p className="text-stone-400 text-xs mt-0.5">80+ labels</p>
                </div>
              </div>

              {/* Trust bar */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-center">
                  <p className="text-white font-bold text-lg leading-none">4.9</p>
                  <p className="text-stone-500 text-xs mt-0.5">Rating</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-bold text-lg leading-none">2,300+</p>
                  <p className="text-stone-500 text-xs mt-0.5">Reviews</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-bold text-lg leading-none">Est. 2018</p>
                  <p className="text-stone-500 text-xs mt-0.5">Since</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-bold text-lg leading-none">50 mi</p>
                  <p className="text-stone-500 text-xs mt-0.5">Local farms</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue — mobile only */}
        <div className="lg:hidden flex flex-col items-center gap-2 text-stone-500 text-xs pb-8">
          <span>Scroll to explore</span>
          <div className="w-px h-6 bg-gradient-to-b from-stone-500 to-transparent" />
        </div>
      </section>

      {/* Info Strip */}
      <section className="bg-white border-b border-stone-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x divide-stone-100">
            {[
              { icon: '⭐', label: 'Rating',        value: '4.9 / 5',      sub: '2,300+ reviews'    },
              { icon: '💸', label: 'Cost for Two',  value: '$60 – $90',    sub: 'approx. per person' },
              { icon: '🕐', label: 'Hours',         value: '12 PM – 11 PM', sub: 'Open daily'        },
              { icon: '📍', label: 'Location',      value: 'Downtown',      sub: '0.8 mi away'       },
              { icon: '🚗', label: 'Parking',       value: 'Free Valet',    sub: 'On request'        },
            ].map((tile) => (
              <div key={tile.label} className="flex items-center gap-3 px-5 py-4 shrink-0">
                <span className="text-xl">{tile.icon}</span>
                <div>
                  <p className="text-xs text-stone-400 font-medium">{tile.label}</p>
                  <p className="font-bold text-stone-900 text-sm whitespace-nowrap">{tile.value}</p>
                  <p className="text-xs text-stone-400 whitespace-nowrap">{tile.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore / Category grid */}
      <section id="explore" className="py-16 px-4 md:px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-amber-600 font-semibold text-xs uppercase tracking-widest mb-1">Explore</p>
            <h2 className="text-2xl font-bold text-stone-900">What would you like?</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} href={cat.href}
                className="group flex flex-col items-center gap-2 bg-white border border-stone-100 rounded-2xl p-4 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
                <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-semibold text-stone-900 text-xs leading-tight">{cat.label}</span>
                <span className="text-xs text-stone-400">{cat.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Offers */}
      <section id="offers" className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-amber-600 font-semibold text-xs uppercase tracking-widest mb-1">Deals &amp; Offers</p>
              <h2 className="text-2xl font-bold text-stone-900">Offers For You</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFERS.map((offer) => (
              <div key={offer.code}
                className={`relative border rounded-2xl p-6 ${offer.color} flex flex-col gap-3 overflow-hidden`}>
                <span className="absolute -right-2 -bottom-3 text-7xl opacity-10 select-none">
                  {offer.icon}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{offer.icon}</span>
                  <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${offer.badge}`}>
                    USE {offer.code}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 text-base">{offer.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{offer.desc}</p>
                <p className="text-xs text-stone-400 mt-1">📅 {offer.valid}</p>
                <Link href="/reservations"
                  className="mt-1 text-sm font-semibold text-amber-700 hover:text-amber-600 transition-colors inline-flex items-center gap-1">
                  Book &amp; Apply →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="py-16 px-4 md:px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-amber-600 font-semibold text-xs uppercase tracking-widest mb-1">Seasonal Offerings</p>
              <h2 className="text-2xl font-bold text-stone-900">Must-Try Dishes</h2>
              <p className="text-stone-500 text-sm mt-1">Handpicked by our chef and loved by guests</p>
            </div>
            <Link href="/menu"
              className="shrink-0 text-sm font-semibold text-amber-600 hover:text-amber-500 border border-amber-200 hover:border-amber-400 px-4 py-2 rounded-lg transition-colors">
              View Full Menu →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DISHES.map((dish) => (
              <div key={dish.name}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                <div className={`h-40 bg-gradient-to-br ${dish.from} ${dish.to} flex items-center justify-center relative`}>
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    {dish.emoji}
                  </span>
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-stone-900/80 backdrop-blur-sm text-amber-400 text-xs font-bold px-2 py-1 rounded-lg">
                    ★ {dish.rating}
                    <span className="text-stone-400 font-normal">({dish.votes})</span>
                  </span>
                  {dish.tag && (
                    <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-lg ${TAG_COLORS[dish.tag] ?? 'bg-white text-stone-700'}`}>
                      {dish.tag}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">{dish.category}</p>
                  <h3 className="font-bold text-stone-900 leading-snug">{dish.name}</h3>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-stone-900">${dish.price}</span>
                    <Link href="/menu"
                      className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-900 px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95">
                      + Add
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Why Bistro Table */}
      <section className="py-16 px-4 md:px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-600 font-semibold text-xs uppercase tracking-widest mb-2">Why Choose Us</p>
            <h2 className="text-3xl font-bold text-stone-900">Crafted with Intention</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🥩', title: 'Farm-to-Table',      body: 'Every ingredient sourced fresh from local farms within 50 miles of our kitchen.'       },
              { icon: '🍷', title: 'Curated Wine List',   body: 'Over 80 hand-selected labels from small-batch wineries across three continents.'        },
              { icon: '👨‍🍳', title: 'Michelin-Trained',   body: 'Head chef Maria Santos brings a decade of starred-kitchen experience to your plate.'    },
              { icon: '🎂', title: 'Private Events',      body: 'Birthdays, anniversaries, and corporate dinners in our exclusive private dining room.'   },
            ].map((h) => (
              <div key={h.title}
                className="group p-6 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-amber-100 transition-colors">
                  {h.icon}
                </div>
                <h3 className="font-bold text-stone-900 text-base mb-2">{h.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-amber-600 font-semibold text-xs uppercase tracking-widest mb-1">What Guests Say</p>
              <h2 className="text-2xl font-bold text-stone-900">Reviews</h2>
            </div>
            <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-stone-900">4.9</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-1">2,300 reviews</p>
              </div>
              <div className="space-y-1.5 w-40">
                {[[5, 88], [4, 9], [3, 2], [2, 1], [1, 0]].map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 w-3 shrink-0">{star}</span>
                    <div className="flex-1 bg-stone-200 rounded-full h-1.5">
                      <div className="bg-amber-400 rounded-full h-1.5" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-stone-400 w-6 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r) => (
              <div key={r.name}
                className="bg-stone-50 border border-stone-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl shrink-0">
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900 text-sm">{r.name}</p>
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">✓</span>
                    </div>
                    <p className="text-xs text-stone-400">{r.tag}</p>
                  </div>
                  <p className="text-xs text-stone-400 shrink-0">{r.date}</p>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>

                <p className="text-stone-600 text-sm leading-relaxed mb-4">"{r.quote}"</p>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <button className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    👍 Helpful ({r.helpful})
                  </button>
                  <button className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,119,6,0.15)_0%,_transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            🔥 Limited Availability Tonight
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Reserve Your Table <span className="text-amber-400">Tonight</span>
          </h2>
          <p className="text-stone-300 text-lg mb-2">
            Only a few slots remaining for this evening's service.
          </p>
          <p className="text-stone-500 text-sm mb-10">
            Dine-in · Indoor &amp; Outdoor seating available · Dietary options on request
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservations"
              className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-10 py-4 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
              Book a Table Now →
            </Link>
            <a href="tel:+15551234567"
              className="border-2 border-white/20 text-white hover:border-amber-400 hover:text-amber-400 font-semibold px-8 py-4 rounded-xl text-base transition-all">
              📞 Call Us
            </a>
          </div>
          <p className="text-stone-600 text-xs mt-6">No credit card required · Free cancellation up to 2 hours before</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍽</span>
              <span className="text-white font-bold text-lg">Bistro Table</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-500 mb-5 max-w-xs">
              A fine dining experience rooted in seasonal ingredients, artisanal techniques, and genuine hospitality. Est. 2018.
            </p>
            <div className="flex items-center gap-3">
              {['Instagram', 'Facebook', 'Yelp', 'TripAdvisor'].map((s) => (
                <button key={s}
                  className="w-8 h-8 bg-stone-800 hover:bg-amber-500 hover:text-stone-900 text-stone-400 rounded-lg flex items-center justify-center text-xs font-bold transition-all">
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-4">Explore</p>
            <ul className="space-y-3 text-sm">
              <li><a href="#menu"         className="hover:text-amber-400 transition-colors">Menu</a></li>
              <li><Link href="/reservations" className="hover:text-amber-400 transition-colors">Reservations</Link></li>
              <li><Link href="/about"     className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><a href="#offers"       className="hover:text-amber-400 transition-colors">Offers &amp; Deals</a></li>
              <li><Link href="/analytics" className="hover:text-amber-400 transition-colors">Analytics</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 py-5 px-4 md:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <span>© 2024 Bistro Table. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-stone-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-stone-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-stone-400 transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
