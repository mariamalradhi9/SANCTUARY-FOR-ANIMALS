"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PickupWindowModal from "@/components/admin/PickupWindowModal";
import { getOrders } from "@/lib/records";
import { readyOrderForPickup, setOrderStatus } from "@/lib/admin/bookingActions";
import { badgeClassFor, formatBHD, formatDate } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Order, OrderStatus } from "@/lib/types";

const DELIVERY_STATUSES: OrderStatus[] = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
const PICKUP_STATUSES: OrderStatus[] = ["Processing", "Ready for Pickup", "Picked Up"];
const ALL_STATUSES: OrderStatus[] = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Ready for Pickup", "Picked Up"];

export default function AdminOrdersPage() {
  usePageTitle("Shop Orders — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [preparingPickupId, setPreparingPickupId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const preparingOrder = useMemo(() => orders.find((o) => o.id === preparingPickupId) || null, [orders, preparingPickupId]);

  function handleStatusChange(id: string, status: OrderStatus) {
    if (status === "Ready for Pickup") {
      setPreparingPickupId(id);
      return;
    }
    const o = setOrderStatus(id, status);
    if (!o) return;
    setOrders(getOrders());
    showToast(`Order ${o.id} marked as "${status}".`);
  }

  function handleConfirmPickupWindow(start: string, end: string) {
    if (!preparingPickupId) return;
    const o = readyOrderForPickup(preparingPickupId, start, end);
    if (o) {
      setOrders(getOrders());
      showToast(`Order ${o.id} is ready for pickup, ${start}–${end}.`);
    }
    setPreparingPickupId(null);
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
                  {ALL_STATUSES.map((s) => (
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
                      <tr><th>Order #</th><th>Donor</th><th>Items</th><th>Total</th><th>Fulfillment</th><th>Placed</th><th>Status</th><th>Update Status</th></tr>
                    </thead>
                    <tbody>
                      {list.map((o) => {
                        const fulfillment = o.fulfillment || "delivery";
                        const statusOptions = fulfillment === "pickup" ? PICKUP_STATUSES : DELIVERY_STATUSES;
                        return (
                          <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>
                              <div><strong>{o.name}</strong></div>
                              <span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{o.phone}</span>
                            </td>
                            <td>{o.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}</td>
                            <td>{formatBHD(o.total)}</td>
                            <td>
                              {fulfillment === "pickup" ? "🏬 Pickup" : "🚚 Delivery"}
                              {fulfillment === "delivery" && o.address && (
                                <><br /><span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{o.address}</span></>
                              )}
                              {fulfillment === "pickup" && o.pickupWindowStart && o.pickupWindowEnd && (
                                <><br /><span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{o.pickupWindowStart}–{o.pickupWindowEnd}</span></>
                              )}
                            </td>
                            <td>{formatDate(o.date)}</td>
                            <td><span className={`badge ${badgeClassFor(o.status)}`}>{o.status}</span></td>
                            <td>
                              <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}>
                                {statusOptions.map((s) => (
                                  <option value={s} key={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <PickupWindowModal
        open={!!preparingOrder}
        orderId={preparingOrder?.id || ""}
        initialStart={preparingOrder?.pickupWindowStart}
        initialEnd={preparingOrder?.pickupWindowEnd}
        onConfirm={handleConfirmPickupWindow}
        onCancel={() => setPreparingPickupId(null)}
      />
    </AuthGuard>
  );
}
