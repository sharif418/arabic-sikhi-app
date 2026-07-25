import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Amiri, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ThemeApplier } from "@/components/app/theme-applier";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "700"],
});

const bengali = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "আরবি শিখি — Arabic Sikhi | Premium Quranic Arabic Learning",
  description:
    "আস-সুন্নাহ ফাউন্ডেশনের উদ্যোগে একটি বিশ্বমানের ফ্রি অ্যাপে কুরআনি আরবি শিখুন। Learn Quranic Arabic free with a gamified, world-class mobile experience.",
  keywords: [
    "Arabic Sikhi",
    "আরবি শিখি",
    "Quranic Arabic",
    "Learn Arabic",
    "As-Sunnah Foundation",
    "আস-সুন্নাহ ফাউন্ডেশন",
    "EdTech",
  ],
  authors: [{ name: "As-Sunnah Foundation" }],
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "আরবি শিখি",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2520" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${amiri.variable} ${bengali.variable} font-sans antialiased`}
      >
        <Providers>
          <ThemeApplier />
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="top-center" />
      </body>
    </html>
  );
}
