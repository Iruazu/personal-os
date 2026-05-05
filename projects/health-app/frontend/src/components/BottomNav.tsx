'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavTab {
  href: string;
  label: string;
  icon: string;
}

const TABS: NavTab[] = [
  { href: '/',          label: 'ホーム',  icon: '🏠' },
  { href: '/workout',   label: '筋トレ',  icon: '🏋️' },
  { href: '/inbody',    label: 'InBody',  icon: '⚖️' },
  { href: '/nutrition', label: '栄養',    icon: '🥗' },
  { href: '/english',   label: '英語',    icon: '📚' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass-nav fixed bottom-0 left-0 right-0 md:hidden border-t"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="メインナビゲーション"
    >
      <div className="flex">
        {TABS.map(({ href, label, icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center min-h-[52px] py-2 gap-0.5 transition-colors ${
                isActive
                  ? 'text-[#8FAF8F]'
                  : 'text-slate-500 hover:text-slate-300 active:text-slate-100'
              }`}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {icon}
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
