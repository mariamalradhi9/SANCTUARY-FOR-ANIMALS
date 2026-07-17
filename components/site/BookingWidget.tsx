"use client";

import { useState } from "react";
import type { Animal, Activity, Booking } from "@/lib/types";
import { getBookings, saveBookings } from "@/lib/records";
import {
  ACTIVITY_PHRASES,
  MONTH_NAMES,
  isDayFullyBooked,
  isSlotBooked,
  toDateKey,
  TIME_SLOTS,
} from "@/lib/booking";

const DURATIONS = ["1 Hour", "2 Hours", "3 Hours", "Half Day", "1 Day", "2 Days", "3 Days", "7 Days (max)"];

export default function BookingWidget({ pet }: { pet: Animal }) {
  const [activity, setActivity] = useState<Activity>("walk");
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ activityLabel: string; dateLabel: string; slot: string; duration: string } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  function selectDay(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedSlot(null);
    setSuccessInfo(null);
  }

  function confirmBooking() {
    if (!name.trim() || !phone.trim() || !selectedDate || !selectedSlot) {
      alert("Please enter your name and phone number to confirm the booking.");
      return;
    }

    const bookings = getBookings();
    const newBooking: Booking = {
      id: "book-" + Date.now(),
      petId: pet.id,
      petName: pet.name,
      activity,
      date: selectedDate,
      slot: selectedSlot,
      duration,
      name: name.trim(),
      phone: phone.trim(),
      status: "Requested",
      history: [{ status: "Requested", date: new Date().toISOString().slice(0, 10) }],
    };
    saveBookings([...bookings, newBooking]);

    const dateObj = new Date(selectedDate + "T00:00:00");
    const dateLabel = dateObj.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const activityLabel = ACTIVITY_PHRASES[activity] || activity;

    setSuccessInfo({ activityLabel, dateLabel, slot: selectedSlot, duration });
    setSelectedSlot(null);
  }

  const calDays: (null | { day: number; dateKey: string; isPast: boolean; isFull: boolean; isSelected: boolean })[] = [];
  for (let i = 0; i < startOffset; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = toDateKey(date);
    const isPast = date < today;
    const isFull = !isPast && isDayFullyBooked(dateKey, pet.id);
    calDays.push({ day: d, dateKey, isPast, isFull, isSelected: selectedDate === dateKey });
  }

  const prevDisabled = year === today.getFullYear() && month === today.getMonth();

  return (
    <section className="visit-booking-section">
      <div className="container">
        <div className="visit-card">
          <div className="visit-intro">
            <span className="eyebrow">Meet Them In Person</span>
            <h2>Book a Visit with {pet.name}</h2>
            <p>Reserve a time slot to take {pet.name} for a walk, a play session, or a grooming visit at the sanctuary.</p>

            <div className="activity-choice">
              <button type="button" className={`activity-btn${activity === "walk" ? " active" : ""}`} onClick={() => setActivity("walk")}><span>🚶</span> Walk</button>
              <button type="button" className={`activity-btn${activity === "play" ? " active" : ""}`} onClick={() => setActivity("play")}><span>🎾</span> Playtime</button>
              <button type="button" className={`activity-btn${activity === "groom" ? " active" : ""}`} onClick={() => setActivity("groom")}><span>🛁</span> Groom</button>
            </div>

            <div className="calendar-legend">
              <span><i className="dot dot-available"></i> Available</span>
              <span><i className="dot dot-selected"></i> Selected</span>
              <span><i className="dot dot-full"></i> Fully booked</span>
            </div>
          </div>

          <div className="calendar-widget">
            <div className="calendar-header">
              <button
                type="button"
                className="cal-nav"
                aria-label="Previous month"
                disabled={prevDisabled}
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
              >
                ‹
              </button>
              <h4>{MONTH_NAMES[month]} {year}</h4>
              <button type="button" className="cal-nav" aria-label="Next month" onClick={() => setCalendarDate(new Date(year, month + 1, 1))}>›</button>
            </div>
            <div className="calendar-weekdays">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="calendar-grid">
              {calDays.map((cell, i) => {
                if (!cell) return <span className="cal-day empty" key={`empty-${i}`}></span>;
                let cls = "cal-day";
                if (cell.isPast) cls += " disabled";
                else if (cell.isFull) cls += " full";
                else cls += " available";
                if (cell.isSelected) cls += " selected";
                return (
                  <button
                    type="button"
                    key={cell.dateKey}
                    className={cls}
                    disabled={cell.isPast || cell.isFull}
                    onClick={() => selectDay(cell.dateKey)}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {selectedDate && !successInfo && (
              <div className="slots-panel">
                <h4>Available Times — {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h4>
                <div className="slots-grid">
                  {TIME_SLOTS.map((slot) => {
                    const booked = isSlotBooked(selectedDate, pet.id, slot);
                    const selected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        className={`slot-btn${selected ? " selected" : ""}`}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                        {booked && <small>Booked</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="booking-confirm">
                <div className="field">
                  <label htmlFor="bookingDuration">How long will you keep them out?</label>
                  <select id="bookingDuration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                    {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="row-2">
                  <div className="field"><label htmlFor="bookingName">Your Name</label><input type="text" id="bookingName" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="field"><label htmlFor="bookingPhone">Phone</label><input type="tel" id="bookingPhone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>
                <button type="button" className="btn btn-primary btn-block" onClick={confirmBooking}>Confirm Booking</button>
              </div>
            )}

            {successInfo && (
              <div className="booking-success">
                ✅ Visit booked! Come by for {successInfo.activityLabel} with <strong>{pet.name}</strong> on{" "}
                <strong>{successInfo.dateLabel} at {successInfo.slot}</strong> for <strong>{successInfo.duration}</strong>.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
