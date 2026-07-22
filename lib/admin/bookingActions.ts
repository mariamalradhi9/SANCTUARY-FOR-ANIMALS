// Status-transition logic for admin booking/application actions, ported from
// admin-common.js's bindBookingActions()/bindApplicationActions(). Framework-agnostic
// so both the Dashboard's "Recent Bookings" preview and the full Bookings/Applications
// admin pages can share it.

import type { Application, Booking, Order, OrderStatus } from "../types";
import { getApplications, getBookings, getOrders, pushHistory, saveApplications, saveBookings, saveOrders } from "../records";
import { logAudit } from "./audit";

export type BookingAction = "confirm" | "cancel" | "complete" | "reset-booking";

export function applyBookingAction(id: string, action: BookingAction): Booking | null {
  const bookings = getBookings();
  const b = bookings.find((x) => x.id === id);
  if (!b) return null;
  if (action === "confirm") b.status = "Confirmed";
  if (action === "cancel") b.status = "Cancelled";
  if (action === "complete") b.status = "Completed";
  if (action === "reset-booking") b.status = "Requested";
  pushHistory(b, b.status);
  saveBookings(bookings);
  logAudit("booking-status", `Booking for ${b.petName} (${b.name}) set to "${b.status}".`);
  return b;
}

export function setOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = getOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return null;
  o.status = status;
  pushHistory(o, status);
  saveOrders(orders);
  logAudit("order-status", `Order ${o.id} (${o.name}) set to "${status}".`);
  return o;
}

export function readyOrderForPickup(id: string, windowStart: string, windowEnd: string): Order | null {
  const orders = getOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return null;
  o.status = "Ready for Pickup";
  o.pickupWindowStart = windowStart;
  o.pickupWindowEnd = windowEnd;
  pushHistory(o, o.status);
  saveOrders(orders);
  logAudit("order-status", `Order ${o.id} (${o.name}) is ready for pickup, ${windowStart}–${windowEnd}.`);
  return o;
}

export function setBookingArrivalTime(id: string, arrivalTime: string): Booking | null {
  const bookings = getBookings();
  const b = bookings.find((x) => x.id === id);
  if (!b) return null;
  b.arrivalTime = arrivalTime;
  saveBookings(bookings);
  logAudit("booking-status", `Arrival time for ${b.petName}'s booking (${b.name}) set to ${arrivalTime}.`);
  return b;
}

export type ApplicationAction = "approve" | "decline" | "reset-application";

export function applyApplicationAction(id: string, action: ApplicationAction): Application | null {
  const apps = getApplications();
  const a = apps.find((x) => x.id === id);
  if (!a) return null;
  if (action === "approve") a.status = "Approved";
  if (action === "decline") a.status = "Declined";
  if (action === "reset-application") a.status = "Pending Review";
  pushHistory(a, a.status);
  saveApplications(apps);
  logAudit("application-status", `Application for ${a.petName} (applicant: ${a.applicant}) set to "${a.status}".`);
  return a;
}

export function scheduleApplicationPickup(id: string, pickupDate: string, pickupTime: string): Application | null {
  const apps = getApplications();
  const a = apps.find((x) => x.id === id);
  if (!a) return null;
  a.pickupDate = pickupDate;
  a.pickupTime = pickupTime;
  saveApplications(apps);
  logAudit("application-status", `Pickup for ${a.petName} (applicant: ${a.applicant}) scheduled for ${pickupDate} at ${pickupTime}.`);
  return a;
}
