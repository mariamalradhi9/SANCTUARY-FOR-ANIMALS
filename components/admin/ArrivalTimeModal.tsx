"use client";

import { useEffect, useState } from "react";
import Modal from "../Modal";

export default function ArrivalTimeModal({
  open,
  petName,
  initialTime,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  petName: string;
  initialTime?: string;
  confirmLabel?: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}) {
  const [time, setTime] = useState(initialTime || "");

  useEffect(() => {
    if (open) setTime(initialTime || "");
  }, [open, initialTime]);

  if (!open) return null;

  return (
    <Modal title={`Set Arrival Time — ${petName}`} onClose={onCancel}>
      <p className="hint" style={{ marginBottom: 16 }}>
        Let the visitor know what time to arrive at the sanctuary (e.g. 30 minutes before their booked slot).
      </p>
      <div className="field">
        <label htmlFor="arrivalTimeInput">Arrival Time</label>
        <input id="arrivalTimeInput" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="step-actions no-print" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={!time} onClick={() => onConfirm(time)}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
