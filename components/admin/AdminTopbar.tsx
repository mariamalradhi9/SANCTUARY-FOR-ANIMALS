"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";

type AdminNavKey = "dashboard" | "animals" | "bookings" | "applications" | "assessment" | "reports";

export default function AdminTopbar({ active, noPrint = false }: { active?: AdminNavKey; noPrint?: boolean }) {
  const router = useRouter();

  return (
    <header className={`admin-topbar${noPrint ? " no-print" : ""}`}>
      <div className="admin-topbar-inner">
        <Link href="/admin" className="admin-brand">
          <img src="/img/logo.png" alt="Aamal Almoayyed Sanctuary for Animals" />
          <span className="logo-text">
            <span className="logo-title">Aamal Almoayyed Sanctuary for Animals</span>
            <span className="logo-sub">Run by BARC</span>
          </span>
        </Link>
        <nav className="admin-nav">
          <Link href="/admin" className={active === "dashboard" ? "active" : ""}>Dashboard</Link>
          <Link href="/admin/animals" className={active === "animals" ? "active" : ""}>Animals</Link>
          <Link href="/admin/bookings" className={active === "bookings" ? "active" : ""}>Bookings</Link>
          <Link href="/admin/applications" className={active === "applications" ? "active" : ""}>Applications</Link>
          <Link href="/admin/assessment" className={active === "assessment" ? "active" : ""}>Assessment</Link>
          <Link href="/admin/reports" className={active === "reports" ? "active" : ""}>Reports</Link>
        </nav>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
        >
          <img src="/icons/logout.png" alt="" className="btn-icon" /> Logout
        </button>
      </div>
    </header>
  );
}
