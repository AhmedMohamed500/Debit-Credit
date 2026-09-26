import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "./game.css";
import "./world.css";
import "./office.css";
import "./first-day.css";
import "./platform.css";
import "./career-entry.css";
import "./landing-v2.css";
import "./landing-v3.css";
import "./landing-v4.css";
import "./beginner-career-world.css";
import "./bootcamp.css";
import { ThemeProvider } from "@/components/platform/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://debit-credit-nine.vercel.app"),
  title: { default: "Debit & Credit Career League | Build Your Accounting Career", template: "%s | Debit & Credit" },
  description: "Work inside simulated companies, solve realistic accounting cases, build professional evidence, and prepare for your next accounting role.",
  applicationName: "Debit & Credit",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/debit-credit-icon.svg", apple: "/debit-credit-icon.svg" },
  openGraph: {
    type: "website",
    siteName: "Debit & Credit",
    title: "Debit & Credit Career League | Build Your Accounting Career",
    description: "Start small, prove your accounting skills through realistic company simulations, and move up.",
  },
};

export const viewport: Viewport = { themeColor: "#0b5f79", colorScheme: "light dark", viewportFit: "cover" };
const themeBoot=`(function(){try{var q=new URLSearchParams(location.search).get('theme');if(q==='light'||q==='dark'||q==='system')localStorage.setItem('debit-credit-theme-v1',q);var p=q||localStorage.getItem('debit-credit-theme-v1')||'light';var d=p==='system'?matchMedia('(prefers-color-scheme: dark)').matches:p==='dark';document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><head><Script id="theme-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:themeBoot}}/></head><body className="min-h-screen bg-daftar-bg text-daftar-text antialiased"><ThemeProvider>{children}</ThemeProvider></body></html>;
}
