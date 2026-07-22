"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PickupWindowModal from "@/components/admin/PickupWindowModal";
import { getOrders } from "@/lib/records";
import { readyOrderForPickup, setOrderStatus } from "@/lib/admin/bookingActions";
import { badgeClassFor, formatBHD, formatDate, formatTime12 } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { FulfillmentMethod, Order, OrderStatus } from "@/lib/types";

const DELIVERY_STATUSES: OrderStatus[] = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
const PICKUP_STATUSES: OrderStatus[] = ["Processing", "Ready for Pickup", "Picked Up"];
const ALL_STATUSES: OrderStatus[] = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Ready for Pickup", "Picked Up"];

export default function AdminOrdersPage() {
  usePageTitle("Shop Orders — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<"" | FulfillmentMethod>("");
  const [search, setSearch] = useState("");
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
      showToast(`Order ${o.id} is ready for pickup, ${formatTime12(start)}–${formatTime12(end)}.`);
    }
    setPreparingPickupId(null);
  }

  const list = useMemo(() => {
    let all = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
    if (fulfillmentFilter) all = all.filter((o) => (o.fulfillment || "delivery") === fulfillmentFilter);
    const q = search.trim().toLowerCase();
    if (q) all = all.filter((o) => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q));
    return all.slice().reverse();
  }, [orders, statusFilter, fulfillmentFilter, search]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="orders" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="admin-card unified-page-card">
              <div className="page-banner-strip">
                <div className="page-banner">
                  <div className="page-banner-copy">
                    <div className="page-banner-icon"><img src="/icons/cart.png" alt="" /></div>
                    <div>
                      <h1>Shop Orders</h1>
                      <p>Sponsorship supply orders placed by donors through the shop.</p>
                    </div>
                  </div>
                  <select className="page-banner-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {ALL_STATUSES.map((s) => (
                      <option value={s} key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pill-filter-bar">
                <button type="button" className={`pill-filter-btn${fulfillmentFilter === "" ? " active" : ""}`} onClick={() => setFulfillmentFilter("")}>
                  <img src="/icons/pets.png" alt="" /> All
                </button>
                <button type="button" className={`pill-filter-btn${fulfillmentFilter === "delivery" ? " active" : ""}`} onClick={() => setFulfillmentFilter("delivery")}>
                  <span aria-hidden>🚚</span> Delivery
                </button>
                <button type="button" className={`pill-filter-btn${fulfillmentFilter === "pickup" ? " active" : ""}`} onClick={() => setFulfillmentFilter("pickup")}>
                  <span aria-hidden>🏬</span> Pickup
                </button>
                <input
                  type="text"
                  className="pill-filter-search"
                  placeholder="Search orders…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {list.length === 0 ? (
                <p className="admin-empty">No shop orders match your filters.</p>
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
                                <><br /><span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{formatTime12(o.pickupWindowStart)}–{formatTime12(o.pickupWindowEnd)}</span></>
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

              <div className="tip-banner">
                <div className="tip-banner-icon"><img src="/icons/heart.png" alt="" /></div>
                <div className="tip-banner-copy">
                  <h4>Quick Tip</h4>
                  <p>Keep order statuses up to date — donors can see live tracking on their dashboard as soon as you update it here.</p>
                </div>
              </div>
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
