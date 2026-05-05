"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useLayoutEffect } from "react";
import { setAuthToken } from "@/lib/api";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function AuthSync() {
  const { data: session } = useSession();
  useIsomorphicLayoutEffect(() => {
    setAuthToken((session as any)?.idToken);
  }, [session]);
  useEffect(() => {
    if ((session as any)?.error === "RefreshTokenError") {
      signIn("google");
    }
  }, [session]);
  return null;
}
