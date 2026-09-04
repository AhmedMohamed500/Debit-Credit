import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://debit-credit.vercel.app"),
  title: { default: "Debit & Credit | Learn Accounting by Doing", template: "%s | Debit & Credit" },
  description: "Interactive accounting education by Money Coder. Learn debit, credit, account nature, journals, and transaction analysis through practice.",
  applicationName: "Debit & Credit",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/debit-credit-icon.svg", apple: "/debit-credit-icon.svg" },
  openGraph: {
    type: "website",
    siteName: "Debit & Credit",
    title: "Debit & Credit | Learn Accounting by Doing",
    description: "Practice accounting through guided learning, money flows, missions, investigations, and a professional arena.",
  },
};

export const viewport: Viewport = { themeColor: "#0b5f79", colorScheme: "light", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><body className="min-h-screen bg-daftar-bg text-daftar-text antialiased">{children}</body></html>;
}
