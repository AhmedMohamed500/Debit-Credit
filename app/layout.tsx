import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./game.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://debit-credit-nine.vercel.app"),
  title: { default: "Debit & Credit | Play. Learn Accounting. Get Hired.", template: "%s | Debit & Credit" },
  description: "A game-based accounting learning platform by Money Coder. Build measurable skills through lessons, practice, missions, cases, and professional simulations.",
  applicationName: "Debit & Credit",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/debit-credit-icon.svg", apple: "/debit-credit-icon.svg" },
  openGraph: {
    type: "website",
    siteName: "Debit & Credit",
    title: "Debit & Credit | Play. Learn Accounting. Get Hired.",
    description: "Learn accounting through one connected game journey and build measurable, career-ready skills.",
  },
};

export const viewport: Viewport = { themeColor: "#0b5f79", colorScheme: "light", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><body className="min-h-screen bg-daftar-bg text-daftar-text antialiased">{children}</body></html>;
}
