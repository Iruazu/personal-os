"use client";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return (
    <div className="flex items-center gap-3 ml-auto">
      <span className="text-xs text-slate-400 hidden sm:block">{session.user.email}</span>
      <button
        onClick={() => signOut()}
        className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1.5 min-h-[36px] transition-colors"
      >
        ログアウト
      </button>
    </div>
  );
}
