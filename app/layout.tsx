import type { Metadata } from "next";

import "./globals.css";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "Audio Note Taker - AI Voice Notes",
  description: "AI-powered voice notes that transform into actionable tasks using MCP and Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
