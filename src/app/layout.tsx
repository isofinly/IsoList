import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import "./globals.css"; // globals.css is imported here

export const metadata: Metadata = {
  title: "IsoView - Your Personal Media Tracker",
  description: "Track movies, series, and anime you've watched or want to watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {" "}
        {/* Padding top for navbar is handled by globals.css body style */}
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
