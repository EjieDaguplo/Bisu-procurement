import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BISU-Bilar Procurement MIS",
  description:
    "Web-Baseds Procurement Management Information System of BISU Bilar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
