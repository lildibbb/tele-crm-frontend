import type { Metadata } from "next";
import Script from "next/script";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { LocaleProvider } from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { SidebarConfigProvider } from "@/context/sidebar-context";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL &&
  /^https?:\/\//.test(process.env.NEXT_PUBLIC_APP_URL)
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://titanjournal.vip";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// ── Font stack: Plus Jakarta Sans (body), Space Grotesk (display), JetBrains Mono (data)
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: "Titan Journal CRM",
  title: {
    default: "Titan Journal CRM",
    template: "%s | Titan Journal CRM",
  },
  description:
    "Titan Journal CRM, empowering financial freedom through smart market education.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/assets/logo/titan-logo-03.svg", type: "image/svg+xml" },
      {
        url: "/assets/logo/email-logo-icon.png",
        sizes: "160x160",
        type: "image/png",
      },
    ],
    shortcut: ["/assets/logo/email-logo-icon.png"],
    apple: [{ url: "/assets/logo/email-logo-icon.png", sizes: "160x160" }],
  },
  openGraph: {
    title: "Titan Journal CRM",
    description:
      "Titan Journal CRM, empowering financial freedom through smart market education.",
    url: APP_URL,
    siteName: "Titan Journal CRM",
    images: [
      {
        url: "/assets/logo/Titan%20Trade%20Circle%20Official%20Logo-03.png",
        width: 9000,
        height: 9000,
        alt: "Titan Journal logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Titan Journal CRM",
    description:
      "Titan Journal CRM, empowering financial freedom through smart market education.",
    images: ["/assets/logo/Titan%20Trade%20Circle%20Official%20Logo-03.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased bg-void text-text-primary`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <NuqsAdapter>
            <QueryProvider>
              <AuthProvider>
                <LocaleProvider>
                  <TooltipProvider delayDuration={300}>
                    <SidebarConfigProvider>{children}</SidebarConfigProvider>
                    <Toaster
                      richColors
                      position="bottom-right"
                      visibleToasts={3}
                      closeButton
                      gap={8}
                    />
                  </TooltipProvider>
                </LocaleProvider>
              </AuthProvider>
            </QueryProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
