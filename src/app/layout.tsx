import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '../context/StoreContext';

export const metadata: Metadata = {
  title: 'Jinoprinx | Multi-Store Business & Inventory Tracker',
  description:
    'Audit sales, track batch-level inventory performance, calculate gross and net surplus, measure turnaround times, and optimize revenue streams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
