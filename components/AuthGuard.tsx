"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

/** Wraps every page except /login. Ported from js/auth-guard.js: every page now
 * requires an active session, otherwise the visitor is bounced to sign-in. */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
