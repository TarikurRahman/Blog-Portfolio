// Trigger deploy: clean layout without AI agent
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import FloatingSocial from "@/components/FloatingSocial";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tarikur.dev/"),
  title: "Tarikur. | Creative Developer & No-Code Architect Portfolio",
  description: "Explore the professional portfolio of Tarikur, presenting high-performance Next.js frontends, custom Shopify sections, Bubble.io no-code software architectures, and UI/UX custom designs.",
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Shopify", "Bubble.io", "No-code Developer", "Portfolio"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Tarikur. | Creative Developer & No-Code Architect Portfolio",
    description: "Explore Next.js frontends, custom Shopify sections, Bubble.io web architectures, and UI/UX design translations.",
    type: "website",
    url: "https://tarikur.dev/",
    images: [
      {
        url: "/nafij-islam-og.png",
        width: 1200,
        height: 630,
        alt: "Tarikur Rahman Portfolio Layout"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nafij. | Creative Developer & No-Code Architect Portfolio",
    description: "Explore Next.js frontends, custom Shopify sections, Bubble.io web architectures, and UI/UX design translations.",
    images: ["/nafij-islam-og.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text font-sans selection:bg-brand-accent selection:text-white" suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <AnalyticsTracker />
            {children}
            <FloatingSocial />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );

}
