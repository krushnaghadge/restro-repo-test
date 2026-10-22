import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservations | Bistro Table',
  description: 'Reserve your table at Bistro Table — fine dining in the heart of the city.',
};

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
