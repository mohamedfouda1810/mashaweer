import type { Metadata } from 'next';
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SocketProvider } from "@/providers/SocketProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: 'Mashaweer | Inter-City Rides',
  description: 'Premium inter-city ride-sharing platform connecting passengers with verified drivers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-white font-sans antialiased dark:bg-zinc-950">
        <SocketProvider>
          <GoogleAnalytics />
          <Navbar />
          <main>{children}</main>
          <BottomNav />
          <Toaster position="top-center" />
        </SocketProvider>
      </body>
    </html>
  );
}
