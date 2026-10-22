import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu | Bistro Table',
  description: 'Explore our seasonal menu — starters, mains, and desserts crafted fresh daily.',
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
