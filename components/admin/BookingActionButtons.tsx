"use client";

import type { BookingAction } from "@/lib/admin/bookingActions";

export default function BookingActionButtons({ status, onAction }: { status: string; onAction: (action: BookingAction) => void }) {
  if (status === "Requested") {
    return (
      <>
        <button type="button" className="round-btn round-btn-approve" title="Approve" onClick={() => onAction("confirm")}>✓</button>
        <button type="button" className="round-btn round-btn-reject" title="Reject" onClick={() => onAction("cancel")}>✕</button>
      </>
    );
  }
  if (status === "Confirmed") {
    return (
      <>
        <button type="button" className="pill-btn" onClick={() => onAction("complete")}>Mark Completed</button>
        <button type="button" className="ghost-btn" onClick={() => onAction("reset-booking")}>↺ Reset</button>
      </>
    );
  }
  return <button type="button" className="ghost-btn" onClick={() => onAction("reset-booking")}>↺ Reset</button>;
}
