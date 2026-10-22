'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAnalytics } from '@/lib/analytics-provider';
import Navbar from '@/components/Navbar';

export default function ReservationsPage() {
  const analytics   = useAnalytics();
  const formStarted = useRef(false);
  const [form, setForm] = useState({ name: '', email: '', date: '', time: '', guests: '2', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  // Track page viewed
  useEffect(() => {
    analytics?.track('reservation_page_viewed', 'Reservation Page Viewed', {});
  }, [analytics]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    // Track first interaction with the form
    if (!formStarted.current) {
      formStarted.current = true;
      analytics?.track('reservation_form_started', 'Reservation Form Started', {});
    }
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleTimeSelect(t: string) {
    analytics?.track('reservation_time_selected', 'Reservation Time Selected', { time: t });
    setForm((f) => ({ ...f, time: t }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    analytics?.track('reservation_completed', 'Reservation Completed', {
      guests: parseInt(form.guests),
      date:   form.date,
      time:   form.time,
    });
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Left — info panel */}
        <div>
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-widest mb-3">Reservations</p>
          <h1 className="text-4xl font-bold text-stone-900 mb-4 leading-tight">
            Reserve Your<br />Table Tonight
          </h1>
          <p className="text-stone-500 leading-relaxed mb-8">
            Whether it's a romantic dinner for two or a celebration with friends, we'll make every moment special. Our team is ready to welcome you.
          </p>

          <div className="space-y-5">
            {[
              { icon: '📍', title: '12 Harbour Lane, Old Town', sub: 'Easy parking nearby' },
              { icon: '⏰', title: 'Open Tue – Sun', sub: '5:00 PM – 10:30 PM' },
              { icon: '📞', title: '+1 (555) 202-3030', sub: 'Call for same-day reservations' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-stone-800">{item.title}</p>
                  <p className="text-stone-400 text-sm">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div>
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">You're All Set!</h2>
              <p className="text-stone-500 mb-1">We're looking forward to seeing you,</p>
              <p className="font-semibold text-stone-800">{form.name}</p>
              <div className="mt-4 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-800 inline-block">
                {form.date} at {form.time} · {form.guests} guest{parseInt(form.guests) > 1 ? 's' : ''}
              </div>
              <button onClick={() => setSubmitted(false)}
                className="mt-6 block text-sm text-amber-600 underline hover:text-amber-500 mx-auto">
                Make another reservation
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 space-y-5">
              <h2 className="text-xl font-bold text-stone-900 mb-1">Reserve a Table</h2>
              <p className="text-stone-400 text-sm">We'll confirm by email within 1 hour.</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" name="name" required value={form.name} onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800 placeholder-stone-300" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800 placeholder-stone-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input type="date" name="date" required value={form.date} onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Guests</label>
                  <select name="guests" value={form.guests} onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800 bg-white">
                    {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'].map((t) => (
                      <button key={t} type="button"
                        onClick={() => handleTimeSelect(t)}
                        className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.time === t
                            ? 'bg-amber-500 border-amber-500 text-stone-900'
                            : 'border-stone-200 text-stone-600 hover:border-amber-300'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  {!form.time && <p className="text-xs text-stone-400 mt-1">Please select a time</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Special Requests <span className="normal-case text-stone-300">(optional)</span></label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                    placeholder="Allergies, celebrations, dietary requirements…"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800 placeholder-stone-300 resize-none" />
                </div>
              </div>

              <button type="submit" disabled={!form.time}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-100 text-sm shadow-sm">
                Confirm Reservation →
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽</span>
            <span className="text-white font-semibold">Bistro Table</span>
            <span className="text-stone-600 ml-2 text-sm">© 2024. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/menu"         className="hover:text-amber-400 transition-colors">Menu</Link>
            <Link href="/reservations" className="text-amber-400">Reservations</Link>
            <Link href="/about"        className="hover:text-amber-400 transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
