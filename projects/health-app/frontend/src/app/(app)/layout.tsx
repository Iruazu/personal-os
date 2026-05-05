"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/UserMenu";
import { BottomNav } from "@/components/BottomNav";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/workout", label: "筋トレ" },
  { href: "/inbody", label: "InBody" },
  { href: "/nutrition", label: "栄養" },
  { href: "/english", label: "英語" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop top nav — hidden on mobile */}
      <nav className="glass-nav hidden md:flex sticky top-0 z-40 border-b px-6 py-3 items-center gap-6">
        {NAV.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                isActive
                  ? "text-white border-b-2 border-[#6B8CAE] pb-0.5"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <UserMenu />
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
