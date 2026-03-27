import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SocketProvider } from "@/providers/SocketProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white antialiased dark:bg-zinc-950`}>
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
