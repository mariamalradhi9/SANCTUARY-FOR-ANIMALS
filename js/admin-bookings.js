// Full booking requests table on admin-bookings.html

document.addEventListener("DOMContentLoaded", () => {
  renderBookingsTable();
  document.getElementById("bookingStatusFilter").addEventListener("change", renderBookingsTable);
});

function renderBookingsTable() {
  const filter = document.getElementById("bookingStatusFilter").value;
  const all = getBookings();
  const list = filter ? all.filter((b) => b.status === filter) : all;
  const el = document.getElementById("bookingsTable");

  if (list.length === 0) {
    el.innerHTML = `<p class="admin-empty">No booking requests ${filter ? "with this status " : ""}yet.</p>`;
    return;
  }

  el.innerHTML = `
    <div class="table-scroll">
      <table class="admin-table">
        <thead>
          <tr><th>User</th><th>Animal</th><th>Activity</th><th>Date &amp; Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>${list.slice().reverse().map(bookingRowHTML).join("")}</tbody>
      </table>
    </div>
  `;

  bindBookingActions(el, renderBookingsTable);
}
