'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, BarChart2 } from 'lucide-react';

const NAV_LINKS = [
  { href: '#explore',  label: 'Explore'       },
  { href: '#offers',   label: 'Offers'        },
  { href: '#menu',     label: 'Menu'          },
  { href: '#reviews',  label: 'Reviews'       },
  { href: '/about',    label: 'About'         },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-stone-900" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Bistro Table</span>
        </Link>

        {/* Open now indicator (only visible on home) */}
        {isHome && (
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open · Closes 11 PM
          </div>
        )}

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-300">
          {isHome
            ? NAV_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className="hover:text-amber-400 transition-colors">
                  {label}
                </a>
              ))
            : [
                { href: '/',             label: 'Home'         },
                { href: '/menu',         label: 'Menu'         },
                { href: '/reservations', label: 'Reservations' },
                { href: '/about',        label: 'About'        },
              ].map(({ href, label }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={active ? 'text-amber-400 font-semibold' : 'hover:text-amber-400 transition-colors'}
                  >
                    {label}
                  </Link>
                );
              })
          }
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/analytics"
            className="hidden md:inline-flex items-center gap-1.5 border border-stone-700 hover:border-amber-500/50 text-stone-400 hover:text-amber-400 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
          >
            <BarChart2 className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link
            href="/reservations"
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            Book a Table
          </Link>
        </div>
      </div>
    </header>
  );
}
