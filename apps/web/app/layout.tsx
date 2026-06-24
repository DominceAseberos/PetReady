import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PetReady — Are You Ready for a Pet?',
  description:
    'Experience realistic pet ownership through multi-day simulations. Get your personalized readiness score before you adopt.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
