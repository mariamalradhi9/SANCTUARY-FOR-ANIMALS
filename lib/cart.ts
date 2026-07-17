// Sponsorship cart, ported from js/shop.js.

import type { CartItem } from "./types";
import { readJSON, writeJSON } from "./storage";

export interface Product {
  id: string;
  name: string;
  category: "food" | "toys" | "accessories" | "treats";
  price: number;
  img: string;
}

const RAW_PRODUCTS: Omit<Product, "img">[] = [
  { id: "kibble-dog", name: "Grain-Free Dog Kibble", category: "food", price: 6.95 },
  { id: "kibble-cat", name: "Salmon Cat Kibble", category: "food", price: 5.25 },
  { id: "hay-rabbit", name: "Timothy Hay Bag", category: "food", price: 3.4 },
  { id: "rope-toy", name: "Rope Tug Toy", category: "toys", price: 2.45 },
  { id: "feather-wand", name: "Feather Wand Toy", category: "toys", price: 1.9 },
  { id: "puzzle-toy", name: "Treat Puzzle Feeder", category: "toys", price: 4.5 },
  { id: "collar", name: "Adjustable Collar", category: "accessories", price: 3.0 },
  { id: "carrier", name: "Pet Travel Carrier", category: "accessories", price: 13.5 },
  { id: "bed", name: "Cozy Pet Bed", category: "accessories", price: 9.0 },
  { id: "biscuits", name: "Peanut Butter Biscuits", category: "treats", price: 1.7 },
  { id: "dental-chew", name: "Dental Chew Sticks", category: "treats", price: 2.65 },
  { id: "catnip", name: "Organic Catnip Pouch", category: "treats", price: 1.3 },
];

export const PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => ({ ...p, img: `/img/Shop/${p.name}.png` }));

export function getCart(): CartItem[] {
  return readJSON<CartItem[]>("pp_cart", []);
}

export function saveCart(cart: CartItem[]): void {
  writeJSON("pp_cart", cart);
}

export function addToCart(productId: string): CartItem[] {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return getCart();
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  return cart;
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
