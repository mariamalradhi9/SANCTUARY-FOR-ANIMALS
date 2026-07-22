// Applications / Bookings / Assessments persistence, ported from js/admin-common.js,
// js/adopt.js, js/booking.js and js/assessment-form.js.

import type { Application, Assessment, Booking, HistoryEntry, Order } from "./types";
import { readJSON, writeJSON } from "./storage";

export function getApplications(): Application[] {
  return readJSON<Application[]>("pp_applications", []);
}
export function saveApplications(list: Application[]): void {
  writeJSON("pp_applications", list);
}

export function getBookings(): Booking[] {
  return readJSON<Booking[]>("pp_bookings", []);
}
export function saveBookings(list: Booking[]): void {
  writeJSON("pp_bookings", list);
}

export function getOrders(): Order[] {
  return readJSON<Order[]>("pp_orders", []);
}
export function saveOrders(list: Order[]): void {
  writeJSON("pp_orders", list);
}

export function getAssessments(): Assessment[] {
  return readJSON<Assessment[]>("pp_assessments", []);
}
export function saveAssessments(list: Assessment[]): void {
  writeJSON("pp_assessments", list);
}

export function getLatestAssessment(petId: string): Assessment | null {
  const list = getAssessments().filter((a) => a.petId === petId);
  if (list.length === 0) return null;
  return list.slice().sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))[0];
}

/** Upserts (by petId) rather than always pushing, so editing an existing
 * assessment updates it in place instead of accumulating duplicates. */
export function saveAssessment(data: Assessment): void {
  const list = getAssessments();
  const idx = list.findIndex((a) => a.petId === data.petId);
  if (idx > -1) list[idx] = data;
  else list.push(data);
  saveAssessments(list);
}

export function pushHistory(entity: { history?: HistoryEntry[] }, status: string): void {
  if (!entity.history) entity.history = [];
  entity.history.push({ status, date: new Date().toISOString().slice(0, 10) });
}

export function latestActivityDate(item: { date: string; history?: HistoryEntry[] }): string {
  const dates = (item.history || []).map((h) => h.date).concat([item.date]);
  return dates.reduce((max, d) => (d > max ? d : max), item.date);
}
