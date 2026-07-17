// Lightweight audit trail: every staff action that changes a record is logged
// here so the sanctuary has a written record for inspections, complaints, or
// incident reviews. Ported from js/admin-common.js.

import type { AuditLogEntry } from "../types";
import { readJSON, writeJSON } from "../storage";

export function getAuditLog(): AuditLogEntry[] {
  return readJSON<AuditLogEntry[]>("pp_audit_log", []);
}

export function logAudit(action: string, summary: string): void {
  const log = getAuditLog();
  log.push({ action, summary, at: new Date().toISOString() });
  writeJSON("pp_audit_log", log);
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "animal-onboarded": "🐾 Animal Onboarded",
  "animal-update": "✏️ Animal Updated",
  "animal-deleted": "🗑️ Animal Removed",
  "assessment-saved": "🧠 Assessment Saved",
  "booking-status": "📅 Booking Status Changed",
  "application-status": "📄 Application Status Changed",
  "report-exported": "⬇️ Report Exported",
};
