// Pure helpers backing the booking calendar widget, ported from js/booking.js.
// Availability is generated deterministically per date/pet so it stays
// consistent across reloads without needing a backend.

export const TIME_SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const ACTIVITY_PHRASES: Record<string, string> = { walk: "a walk", play: "a play session", groom: "a grooming visit" };

export function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isDayFullyBooked(dateKey: string, petId: string): boolean {
  return hashCode(dateKey + petId + "full") % 6 === 0;
}

export function isSlotBooked(dateKey: string, petId: string, slot: string): boolean {
  return hashCode(dateKey + petId + slot) % 3 === 0;
}
