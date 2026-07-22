// Small formatting/status helpers ported from js/admin-common.js and js/dashboard.js.

export function badgeClassFor(status: string): string {
  if (status === "Approved" || status === "Confirmed" || status === "Completed" || status === "Delivered" || status === "Picked Up") return "badge-success";
  if (status === "Declined" || status === "Cancelled") return "badge-danger";
  return "badge-warning";
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatBHD(amount: number): string {
  return `${amount.toFixed(3)} BD`;
}

/** Converts a 24h "HH:MM" time (as produced by <input type="time">) to 12h "h:MM AM/PM". */
export function formatTime12(time?: string): string {
  if (!time) return "—";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr.padStart(2, "0")} ${period}`;
}

export function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr + "T00:00:00");
  if (isNaN(then.getTime())) return null;
  return Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dateStr?: string): boolean {
  const d = daysSince(dateStr);
  return d !== null && d > 0;
}

/** Age in years (decimal) computed from a date of birth, e.g. 0.7 for an 8-month-old. */
export function calculateAge(dob?: string): number {
  if (!dob) return 0;
  const birth = new Date(dob + "T00:00:00");
  if (isNaN(birth.getTime())) return 0;
  const years = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
}

/** "8 months" / "2 years" label matching the age display used across the site. */
export function ageLabel(dob?: string): string {
  const age = calculateAge(dob);
  return age < 1 ? `${Math.round(age * 12)} months` : `${age} years`;
}

const STATUS_CATEGORY: Record<string, "accepted" | "rejected"> = {
  Approved: "accepted",
  Confirmed: "accepted",
  Completed: "accepted",
  Declined: "rejected",
  Cancelled: "rejected",
};

export function statusCategoryFor(status: string): "accepted" | "rejected" | "pending" {
  return STATUS_CATEGORY[status] || "pending";
}
