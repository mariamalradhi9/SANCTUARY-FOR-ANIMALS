"use client";

import { useEffect, useState } from "react";
import type { Assessment } from "@/lib/types";
import { getLatestAssessment } from "@/lib/records";
import { DISPOSITION_LEVEL_CLASS, hasBehavioralDetails } from "@/lib/petProfile";
import BehavioralDetails from "./BehavioralDetails";
import Modal from "../Modal";

/** Compact teaser: disposition badge + a "View Full Report" trigger, with the
 * heavy sections deferred to a modal instead of always being inlined. Used on
 * both the Pet Details page and the Adoption Application sidebar. */
export default function BehavioralProfile({ petId, petName }: { petId: string; petName: string }) {
  const [latest, setLatest] = useState<Assessment | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLatest(getLatestAssessment(petId));
  }, [petId]);

  if (!latest) return null;

  const levelClass = DISPOSITION_LEVEL_CLASS[latest.disposition] || "";
  const showReportBtn = hasBehavioralDetails(latest);

  return (
    <div className="behavioral-profile">
      <h3>🐾 Behavioral Profile</h3>
      {latest.disposition && (
        <div className={`disposition-option ${levelClass}`} style={{ cursor: "default" }}>
          <span><strong>{latest.disposition}</strong> — assessed by our sanctuary staff</span>
        </div>
      )}
      {showReportBtn && (
        <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => setOpen(true)}>
          📋 View Full Behavioral Report
        </button>
      )}
      {open && (
        <Modal title={`${petName}'s Behavioral Report`} onClose={() => setOpen(false)}>
          <BehavioralDetails latest={latest} />
        </Modal>
      )}
    </div>
  );
}
