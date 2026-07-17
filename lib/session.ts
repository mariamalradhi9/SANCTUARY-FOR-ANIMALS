// Session / demo-account auth, ported from js/login.js. Not wired to any real
// authentication or route protection — every page remains directly reachable
// without signing in, matching the original prototype's behavior.

import type { Session } from "./types";
import { readJSON, removeKey, writeJSON } from "./storage";

export const DEMO_ACCOUNTS: Record<string, { password: string; role: Session["role"]; redirect: string; name: string }> = {
  "admin@aamalalmoayyed.bh": { password: "12345", role: "admin", redirect: "/admin", name: "Staff Admin" },
  "user@aamalalmoayyed.bh": { password: "12345", role: "user", redirect: "/", name: "Sarina Adams" },
};

export function getSession(): Session | null {
  return readJSON<Session | null>("pp_session", null);
}

export function setSession(session: Session): void {
  writeJSON("pp_session", session);
}

export function clearSession(): void {
  removeKey("pp_session");
}
