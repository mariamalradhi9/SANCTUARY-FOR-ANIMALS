"use client";

import Modal from "./Modal";

/** Reusable "are you sure?" confirmation, styled to match the site instead of the browser's native confirm(). */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary" style={{ background: "var(--color-danger)" }} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
