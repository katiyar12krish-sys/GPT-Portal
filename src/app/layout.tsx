/**
 * Root HTML layout: page title / description (SEO), fonts, theme colour, app icons and the service worker for the installable app.
 */
import type { Metadata, Viewport } from 'next';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './globals.css';
import { ServiceWorkerRegister } from '../components/mobile/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#13294b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Uttarakhand Government Institute of Polytechnic, Tanakpur - Placement & Student Portal',
  description:
    'Training & Placement Cell portal of Uttarakhand Government Institute of Polytechnic, Tanakpur (Champawat, Uttarakhand): student records, resume upload and analysis, placement Q&A, mock interviews, Job House for government and private jobs, and college chat.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UGIP Tanakpur',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Uttarakhand Government Institute of Polytechnic, Tanakpur - Placement & Student Portal',
    description:
      'Training & Placement Cell portal of Uttarakhand Government Institute of Polytechnic, Tanakpur (Champawat, Uttarakhand): student records, resume upload and analysis, placement Q&A, mock interviews, Job House for government and private jobs, and college chat.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uttarakhand Government Institute of Polytechnic, Tanakpur - Placement & Student Portal',
    description:
      'Training & Placement Cell portal of Uttarakhand Government Institute of Polytechnic, Tanakpur (Champawat, Uttarakhand): student records, resume upload and analysis, placement Q&A, mock interviews, Job House for government and private jobs, and college chat.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased selection:bg-cyan-600 selection:text-white transition-colors duration-200">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
