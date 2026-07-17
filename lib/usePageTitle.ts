"use client";

import { useEffect } from "react";

/** Every page here is a Client Component (localStorage-driven, no server data
 * source), so the `metadata` export isn't available — this sets the browser
 * tab title the same way the original static site did per-page. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
