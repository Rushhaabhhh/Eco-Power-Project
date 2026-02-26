import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eco Power Project",
  description: "Thermoelectric power generation and carbon air filtration science project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
