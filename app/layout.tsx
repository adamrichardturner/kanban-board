import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Toaster } from '@/components/ui/sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
});

export const viewport =
  'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

export const metadata: Metadata = {
  title: 'Kanban Board | Adam Richard Turner',
  description:
    'Organize tasks, track progress, and boost productivity with our intuitive Kanban board application. Drag-and-drop functionality with real-time updates.',
  openGraph: {
    type: 'website',
    url: 'https://kanban.adamrichardturner.dev',
    title: 'Kanban Board | Adam Richard Turner',
    description:
      'Organize tasks, track progress, and boost productivity with our intuitive Kanban board application. Drag-and-drop functionality with real-time updates.',
    images: [
      {
        url: 'https://kanban.adamrichardturner.dev/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kanban Board dashboard preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://kanban.adamrichardturner.dev',
    title: 'Kanban Board | Adam Richard Turner',
    description:
      'Organize tasks, track progress, and boost productivity with our intuitive Kanban board application. Drag-and-drop functionality with real-time updates.',
    images: ['https://kanban.adamrichardturner.dev/og-image.png'],
    creator: '@devadam88',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${plusJakartaSans.className}`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
