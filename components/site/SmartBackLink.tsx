"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** Ported from bindSmartBack() in js/main.js: returns the visitor to the page
 * they actually came from (within this site) instead of always the same
 * hardcoded destination, falling back to `href` for deep links / direct opens. */
export default function SmartBackLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter();

  return (
    <a
      href={href}
      className="back-link"
      onClick={(e) => {
        const cameFromSite = typeof document !== "undefined" && document.referrer && document.referrer.startsWith(window.location.origin);
        if (cameFromSite && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      {children}
    </a>
  );
}
