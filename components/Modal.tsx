"use client";

import type { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="admin-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
