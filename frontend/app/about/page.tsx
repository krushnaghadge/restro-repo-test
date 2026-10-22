import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = { title: 'About | Bistro Table' };

const TEAM = [
  {
    name: 'Maria Santos',
    role: 'Head Chef',
    bio: 'Trained at Le Cordon Bleu Paris, Maria brings a decade of Michelin-starred kitchen experience to every plate.',
    emoji: '👨‍🍳',
  },
  {
    name: 'James Holloway',
    role: 'Sommelier',
    bio: 'James curates our 80+ label wine list, sourcing exclusively from small-batch wineries across three continents.',
    emoji: '🍷',
  },
  {
    name: 'Priya Mehta',
    role: 'General Manager',
    bio: 'Priya ensures every visit feels personal — from the first booking to the final bite.',
    emoji: '🌟',
  },
];

const VALUES = [
  { icon: '🥩', title: 'Local Sourcing',      body: 'Every ingredient sourced fresh from farms within 50 miles of our kitchen.' },
  { icon: '♻️', title: '90% Zero Waste',       body: 'We compost over 90% of kitchen waste and work with suppliers who share our values.' },
  { icon: '🌿', title: 'Seasonal Menus',       body: 'Our menu rotates quarterly to celebrate the best of each season.' },
  { icon: '🤝', title: 'Community First',      body: 'We hire locally, source locally, and give back 2% of revenue to food-bank charities.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-r from-stone-900 to-amber-950 py-20 px-6 text-center">
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Crafted with Intention</h1>
        <p className="text-stone-300 max-w-xl mx-auto text-base leading-relaxed">
          Founded in 2018, Bistro Table has been a cornerstone of the city's fine dining scene — where exceptional food meets genuine hospitality.
        </p>
      </section>

      {/* ── Story ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-5 text-stone-600 text-base leading-relaxed">
          <p>
            We believe that exceptional food is more than ingredients — it is memory, craft, and connection. Every dish that leaves our kitchen carries the intention of the hands that made it and the stories of the farms that grew it.
          </p>
          <p>
            Our head chef, Maria Santos, trained at Le Cordon Bleu Paris and brings a decade of Michelin-starred experience to every plate. The menu changes quarterly to reflect the best of each season — you will never eat the same meal twice.
          </p>
          <p>
            We source produce from within 50 miles, partner with small-batch wineries, and compost over 90% of our kitchen waste. Sustainability is not a tagline here; it is built into every decision we make.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-3xl font-bold text-stone-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-stone-100 p-6 hover:border-amber-200 hover:bg-amber-50 transition-all">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-stone-900 mb-2">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">The People</p>
            <h2 className="text-3xl font-bold text-stone-900">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-stone-50 rounded-2xl p-7 text-center border border-stone-100">
                <div className="text-5xl mb-4">{member.emoji}</div>
                <h3 className="font-bold text-stone-900 text-lg">{member.name}</h3>
                <p className="text-amber-600 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-stone-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 bg-gradient-to-br from-amber-900 to-stone-900 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Come Experience It Yourself</h2>
        <p className="text-stone-300 mb-8 max-w-md mx-auto">A table is waiting for you. Reserve yours and let us show you what we're made of.</p>
        <Link
          href="/reservations"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          Reserve a Table →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽</span>
            <span className="text-white font-semibold">Bistro Table</span>
            <span className="text-stone-600 ml-2 text-sm">© 2024. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/menu"         className="hover:text-amber-400 transition-colors">Menu</Link>
            <Link href="/reservations" className="hover:text-amber-400 transition-colors">Reservations</Link>
            <Link href="/about"        className="hover:text-amber-400 transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
