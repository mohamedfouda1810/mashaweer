import type { Metadata, Viewport } from 'next';
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SocketProvider } from "@/providers/SocketProvider";
import { Toaster } from "react-hot-toast";
import { LanguageToggle } from "@/components/LanguageToggle";

export const metadata: Metadata = {
  title: 'Mashaweer | Inter-City Rides',
  description: 'Premium inter-city ride-sharing platform connecting passengers with verified drivers.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1A4270',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Non-render-blocking font loading (moved from CSS @import) */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-sans antialiased dark:bg-navy-dark">
        <SocketProvider>
          <GoogleAnalytics />
          <Navbar />
          <div className="pointer-events-none fixed right-4 top-[4.5rem] z-40 sm:hidden">
            <div className="pointer-events-auto"><LanguageToggle /></div>
          </div>
          <main>{children}</main>
          <BottomNav />
          <Toaster position="top-center" />
        </SocketProvider>
      </body>
    </html>
  );
}
