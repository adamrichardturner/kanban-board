import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://kanban.adamrichardturner.dev',
  ),
  title: 'Kanban Board | Adam Richard Turner',
  description:
    'Organize tasks, track progress, and boost productivity with our intuitive Kanban board application. Drag-and-drop functionality with real-time updates.',
  openGraph: {
    siteName: 'Kanban Board',
    type: 'website',
    url: '/',
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
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@devadam88',
    title: 'Kanban Board | Adam Richard Turner',
    description:
      'Organize tasks, track progress, and boost productivity with our intuitive Kanban board application. Drag-and-drop functionality with real-time updates.',
    images: [
      {
        url: 'https://kanban.adamrichardturner.dev/og-image.png',
        alt: 'Kanban Board dashboard preview',
      },
    ],
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
        <Script id='theme-init' strategy='beforeInteractive'>
          {`
            (function() {
              try {
                var stored = localStorage.getItem('theme');
                var root = document.documentElement;
                if (stored === 'dark') {
                  root.classList.add('dark');
                } else if (stored === 'light') {
                  root.classList.remove('dark');
                } else {
                  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }
                }
              } catch (e) {
                // no-op
              }
            })();
          `}
        </Script>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
