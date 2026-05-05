import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { UserMenu } from "@/components/UserMenu";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import BottomNav from "@/components/BottomNav";
import { AuthSync } from "@/components/AuthSync";

export const metadata: Metadata = {
  title: "Health Tracker",
  description: "Personal health tracking app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Health Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/workout", label: "筋トレ" },
  { href: "/inbody", label: "InBody" },
  { href: "/nutrition", label: "栄養" },
  { href: "/english", label: "英語" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100">
        <Providers>
          <ServiceWorkerRegistration />
          <AuthSync />
          <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex gap-6 items-center">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
            <UserMenu />
          </nav>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
