"use client";

import { useEffect, useState } from "react";
import Modal from "../Modal";

export default function PickupWindowModal({
  open,
  orderId,
  initialStart,
  initialEnd,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  orderId: string;
  initialStart?: string;
  initialEnd?: string;
  onConfirm: (start: string, end: string) => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState(initialStart || "08:00");
  const [end, setEnd] = useState(initialEnd || "17:00");

  useEffect(() => {
    if (open) {
      setStart(initialStart || "08:00");
      setEnd(initialEnd || "17:00");
    }
  }, [open, initialStart, initialEnd]);

  if (!open) return null;

  return (
    <Modal title={`Ready for Pickup — ${orderId}`} onClose={onCancel}>
      <p className="hint" style={{ marginBottom: 16 }}>
        Set the window during which the donor can come collect this order.
      </p>
      <div className="row-2">
        <div className="field">
          <label htmlFor="pickupWindowStart">From</label>
          <input id="pickupWindowStart" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pickupWindowEnd">To</label>
          <input id="pickupWindowEnd" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div className="step-actions no-print" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={!start || !end} onClick={() => onConfirm(start, end)}>
          Mark Ready
        </button>
      </div>
    </Modal>
  );
}
