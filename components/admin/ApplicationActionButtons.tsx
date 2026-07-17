"use client";

import type { ApplicationAction } from "@/lib/admin/bookingActions";

export default function ApplicationActionButtons({ status, onAction }: { status: string; onAction: (action: ApplicationAction) => void }) {
  if (status === "Pending Review") {
    return (
      <>
        <button type="button" className="round-btn round-btn-approve" title="Approve" onClick={() => onAction("approve")}>✓</button>
        <button type="button" className="round-btn round-btn-reject" title="Decline" onClick={() => onAction("decline")}>✕</button>
      </>
    );
  }
  return <button type="button" className="ghost-btn" onClick={() => onAction("reset-application")}>↺ Reset</button>;
}
