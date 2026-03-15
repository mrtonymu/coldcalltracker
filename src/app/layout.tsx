import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import FollowUpNotificationInit from "@/components/FollowUpNotificationInit";
import { ActiveCallProvider } from "@/contexts/ActiveCallContext";
import ActiveCallBar from "@/components/ActiveCallBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cold Call Tracker",
  description: "Track your cold calls and follow-ups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ActiveCallProvider>
          <Navbar />
          <FollowUpNotificationInit />
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
          <ActiveCallBar />
        </ActiveCallProvider>
      </body>
    </html>
  );
}
