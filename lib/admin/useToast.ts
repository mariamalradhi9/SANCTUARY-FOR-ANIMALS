"use client";

import { useCallback, useRef, useState } from "react";

/** Ported from admin-common.js's showToast(): fades a message in, then auto-hides it. */
export function useToast() {
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 3200);
  }, []);

  return { message, show, showToast };
}
