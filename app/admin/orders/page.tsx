"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getOrders } from "@/lib/records";
import { setOrderStatus } from "@/lib/admin/bookingActions";
import { badgeClassFor, formatBHD, formatDate } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

export default function AdminOrdersPage() {
  usePageTitle("Shop Orders — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  function handleStatusChange(id: string, status: OrderStatus) {
    const o = setOrderStatus(id, status);
    if (!o) return;
    setOrders(getOrders());
    showToast(`Order ${o.id} marked as "${status}".`);
  }

  const list = useMemo(() => {
    const all = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
    return all.slice().reverse();
  }, [orders, statusFilter]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="orders" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="admin-card">
              <div className="admin-card-head">
                <div>
                  <h3>Shop Orders</h3>
                  <p style={{ margin: "4px 0 0" }}>Sponsorship supply orders placed by donors through the shop.</p>
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  {STATUSES.map((s) => (
                    <option value={s} key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {list.length === 0 ? (
                <p className="admin-empty">No shop orders {statusFilter ? "with this status " : ""}yet.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order #</th><th>Donor</th><th>Items</th><th>Total</th><th>Placed</th><th>Status</th><th>Update Status</th></tr>
                    </thead>
                    <tbody>
                      {list.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>
                            <div><strong>{o.name}</strong></div>
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{o.phone}</span>
                          </td>
                          <td>{o.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}</td>
                          <td>{formatBHD(o.total)}</td>
                          <td>{formatDate(o.date)}</td>
                          <td><span className={`badge ${badgeClassFor(o.status)}`}>{o.status}</span></td>
                          <td>
                            <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}>
                              {STATUSES.map((s) => (
                                <option value={s} key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
