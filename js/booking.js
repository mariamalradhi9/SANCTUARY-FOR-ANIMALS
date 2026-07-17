// Visit-booking calendar widget on pet-details.html.
// Availability is generated deterministically per date/pet so it stays
// consistent across reloads without needing a backend.

const TIME_SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let bookingActivity = "walk";
let bookingCalendarDate = new Date();
let bookingSelectedDate = null;
let bookingSelectedSlot = null;

document.addEventListener("DOMContentLoaded", () => {
  const pet = window.currentPet || getAnimals()[0];
  document.getElementById("bookingPetName").textContent = pet.name;
  document.getElementById("bookingTitle").textContent = `Book a Visit with ${pet.name}`;

  document.querySelectorAll(".activity-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      bookingActivity = btn.dataset.activity;
      document.querySelectorAll(".activity-btn").forEach((b) => b.classList.toggle("active", b === btn));
      if (bookingSelectedDate) renderSlots(pet);
    });
  });

  document.getElementById("prevMonth").addEventListener("click", () => {
    bookingCalendarDate.setMonth(bookingCalendarDate.getMonth() - 1);
    renderCalendar(pet);
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    bookingCalendarDate.setMonth(bookingCalendarDate.getMonth() + 1);
    renderCalendar(pet);
  });

  document.getElementById("confirmBookingBtn").addEventListener("click", () => confirmBooking(pet));

  renderCalendar(pet);
});

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isDayFullyBooked(dateKey, petId) {
  return hashCode(dateKey + petId + "full") % 6 === 0;
}

function isSlotBooked(dateKey, petId, slot) {
  return hashCode(dateKey + petId + slot) % 3 === 0;
}

function renderCalendar(pet) {
  const year = bookingCalendarDate.getFullYear();
  const month = bookingCalendarDate.getMonth();
  document.getElementById("calMonthLabel").textContent = `${MONTH_NAMES[month]} ${year}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const grid = document.getElementById("calendarGrid");
  let html = "";
  for (let i = 0; i < startOffset; i++) html += `<span class="cal-day empty"></span>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = toDateKey(date);
    const isPast = date < today;
    const isFull = !isPast && isDayFullyBooked(dateKey, pet.id);
    const isSelected = bookingSelectedDate === dateKey;

    let cls = "cal-day";
    if (isPast) cls += " disabled";
    else if (isFull) cls += " full";
    else cls += " available";
    if (isSelected) cls += " selected";

    html += `<button type="button" class="${cls}" data-date="${dateKey}" ${isPast || isFull ? "disabled" : ""}>${d}</button>`;
  }

  grid.innerHTML = html;
  grid.querySelectorAll(".cal-day.available, .cal-day.selected").forEach((btn) => {
    btn.addEventListener("click", () => selectDay(btn.dataset.date, pet));
  });

  const prevBtn = document.getElementById("prevMonth");
  prevBtn.disabled = year === today.getFullYear() && month === today.getMonth();
}

function selectDay(dateKey, pet) {
  bookingSelectedDate = dateKey;
  bookingSelectedSlot = null;
  renderCalendar(pet);
  renderSlots(pet);
  document.getElementById("bookingConfirm").style.display = "none";
  document.getElementById("bookingSuccess").style.display = "none";
}

function renderSlots(pet) {
  const panel = document.getElementById("slotsPanel");
  const dateObj = new Date(bookingSelectedDate + "T00:00:00");
  document.getElementById("selectedDateLabel").textContent = dateObj.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const grid = document.getElementById("slotsGrid");
  grid.innerHTML = TIME_SLOTS.map((slot) => {
    const booked = isSlotBooked(bookingSelectedDate, pet.id, slot);
    const selected = bookingSelectedSlot === slot;
    return `<button type="button" class="slot-btn ${selected ? "selected" : ""}" data-slot="${slot}" ${booked ? "disabled" : ""}>${slot}${booked ? "<small>Booked</small>" : ""}</button>`;
  }).join("");

  grid.querySelectorAll(".slot-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      bookingSelectedSlot = btn.dataset.slot;
      grid.querySelectorAll(".slot-btn").forEach((b) => b.classList.toggle("selected", b === btn));
      document.getElementById("bookingConfirm").style.display = "block";
    });
  });

  panel.style.display = "block";
}

const ACTIVITY_PHRASES = { walk: "a walk", play: "a play session", groom: "a grooming visit" };

function confirmBooking(pet) {
  const name = document.getElementById("bookingName").value.trim();
  const phone = document.getElementById("bookingPhone").value.trim();
  const duration = document.getElementById("bookingDuration").value;
  if (!name || !phone) {
    alert("Please enter your name and phone number to confirm the booking.");
    return;
  }

  const bookings = JSON.parse(localStorage.getItem("pp_bookings") || "[]");
  bookings.push({
    id: "book-" + Date.now(),
    petId: pet.id,
    petName: pet.name,
    activity: bookingActivity,
    date: bookingSelectedDate,
    slot: bookingSelectedSlot,
    duration,
    name,
    phone,
    status: "Requested",
    history: [{ status: "Requested", date: new Date().toISOString().slice(0, 10) }],
  });
  localStorage.setItem("pp_bookings", JSON.stringify(bookings));

  const dateObj = new Date(bookingSelectedDate + "T00:00:00");
  const dateLabel = dateObj.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const activityLabel = ACTIVITY_PHRASES[bookingActivity] || bookingActivity;

  document.getElementById("slotsPanel").style.display = "none";
  document.getElementById("bookingConfirm").style.display = "none";
  const success = document.getElementById("bookingSuccess");
  success.innerHTML = `✅ Visit booked! Come by for ${activityLabel} with <strong>${pet.name}</strong> on <strong>${dateLabel} at ${bookingSelectedSlot}</strong> for <strong>${duration}</strong>.`;
  success.style.display = "block";
}
