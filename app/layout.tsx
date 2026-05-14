import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auction · Final Bosu',
  description: '3 treasury NFTs. 24-hour offer window on OpenSea.',
  openGraph: {
    title: 'Auction · Final Bosu',
    description: '3 treasury NFTs. 24-hour offer window on OpenSea.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auction · Final Bosu',
    description: '3 treasury NFTs. 24-hour offer window on OpenSea.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
