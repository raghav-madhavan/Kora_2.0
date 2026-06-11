import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kora Admin",
  description: "School admin compliance console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
