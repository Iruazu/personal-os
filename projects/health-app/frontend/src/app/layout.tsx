import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Health Tracker",
  description: "Personal health tracking app",
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
      <body className="min-h-screen bg-gray-950 text-gray-100">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex gap-6">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
