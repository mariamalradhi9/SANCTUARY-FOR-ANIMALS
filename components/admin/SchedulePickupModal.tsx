"use client";

import { useEffect, useState } from "react";
import Modal from "../Modal";

export default function SchedulePickupModal({
  open,
  petName,
  initialDate,
  initialTime,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  petName: string;
  initialDate?: string;
  initialTime?: string;
  confirmLabel?: string;
  onConfirm: (date: string, time: string) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState(initialTime || "");

  useEffect(() => {
    if (open) {
      setDate(initialDate || "");
      setTime(initialTime || "");
    }
  }, [open, initialDate, initialTime]);

  if (!open) return null;

  return (
    <Modal title={`Schedule Pickup — ${petName}`} onClose={onCancel}>
      <p className="hint" style={{ marginBottom: 16 }}>
        Let the adopter know when they can come pick up {petName}.
      </p>
      <div className="row-2">
        <div className="field">
          <label htmlFor="schedPickupDate">Date</label>
          <input id="schedPickupDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="schedPickupTime">Time</label>
          <input id="schedPickupTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="step-actions no-print" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={!date || !time} onClick={() => onConfirm(date, time)}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
