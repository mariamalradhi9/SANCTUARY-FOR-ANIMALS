import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aamal Almoayyed Sanctuary — Find Your Forever Friend",
  description: "Bahrain's biggest animal sanctuary — giving animals a loving home.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
