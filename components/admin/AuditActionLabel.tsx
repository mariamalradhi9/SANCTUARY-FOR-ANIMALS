import { AUDIT_ACTION_LABELS, AUDIT_ACTION_ICONS } from "@/lib/admin/audit";

export default function AuditActionLabel({ action }: { action: string }) {
  const icon = AUDIT_ACTION_ICONS[action];
  const label = AUDIT_ACTION_LABELS[action] || action;
  if (icon) return <><img src={icon} alt="" className="icon-img-sm" /> {label}</>;
  return <>{label}</>;
}
