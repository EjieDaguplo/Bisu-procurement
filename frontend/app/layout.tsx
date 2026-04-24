import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BISU-Bilar Procurement MIS",
  description:
    "Web-Based Procurement Management Information System of BISU Bilar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/bisuLogo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
