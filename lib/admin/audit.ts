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
  "animal-onboarded": "Animal Onboarded",
  "animal-update": "Animal Updated",
  "animal-deleted": "🗑️ Animal Removed",
  "assessment-saved": "<img src=\"/icons/user.png\" alt=\"\" className=\"icon-img-sm\" /> Assessment Saved",
  "booking-status": "Booking Status Changed",
  "application-status": "Application Status Changed",
  "order-status": "Shop Order Status Changed",
  "report-exported": "Report Exported",
};

/** Icons for actions that have a dedicated one; actions without an entry here keep their emoji baked into AUDIT_ACTION_LABELS above. */
export const AUDIT_ACTION_ICONS: Record<string, string> = {
  "animal-onboarded": "/icons/paw.png",
  "animal-update": "/icons/edit.png",
  "booking-status": "/icons/calendar.png",
  "application-status": "/icons/documents.png",
  "order-status": "/icons/cart.png",
  "report-exported": "/icons/export.png",
};
