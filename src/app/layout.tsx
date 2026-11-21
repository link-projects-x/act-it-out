import type { ReactNode } from 'react';

import { Bebas_Neue, Courier_Prime, Inter, JetBrains_Mono } from 'next/font/google';

import type { Metadata, Viewport } from 'next';

import '@/styles/globals.scss';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});
const script = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-script',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Act it out · Can you fool an AI with your voice?',
  description:
    'A screen test judged by AI: act out five lines and a speech emotion model, running in your browser, decides if it believes you.',
};

export const viewport: Viewport = {
  themeColor: '#0e0d0c',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const fonts = [sans, display, script, mono].map((font) => font.variable).join(' ');
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
