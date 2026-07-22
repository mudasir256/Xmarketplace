import type { Metadata } from "next";
import "./globals.css";
import { LocationProvider } from "@/providers/location-provider";

export const metadata: Metadata = {
  title: {
    default: "X Marketplace — Buy & Sell in Pakistan",
    template: "%s | X Marketplace",
  },
  description: "Pakistan's modern classified marketplace and official online store.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}
