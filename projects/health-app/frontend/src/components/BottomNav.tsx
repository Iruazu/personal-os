'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavTab {
  href: string;
  label: string;
  icon: string;
}

const TABS: NavTab[] = [
  { href: '/workout', label: '筋トレ', icon: '🏋️' },
  { href: '/inbody', label: 'InBody', icon: '⚖️' },
  { href: '/nutrition', label: '栄養', icon: '🥗' },
  { href: '/english', label: '英語', icon: '📚' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden bg-slate-900 border-t border-slate-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center min-h-[48px] py-2 gap-0.5 transition-colors ${
                isActive
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 active:text-slate-100'
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
