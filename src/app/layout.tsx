import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getHeader, getSettings } from "@/lib/data";
import ThemeColors from "@/components/site/ThemeColors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [header, settings] = await Promise.all([getHeader(null), getSettings()]);
    const favicon = header?.favicon || "";
    return {
      title: header?.site_name || settings.site_title || "Mi Sitio",
      description: settings.site_description || "",
      ...(favicon ? { icons: { icon: favicon } } : {}),
    };
  } catch {
    return { title: "Mi Sitio" };
  }
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <ThemeColors />
        {children}
      </body>
    </html>
  );
}
