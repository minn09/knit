import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { SyncProvider } from "@/components/sync/SyncProvider";
import { ThemeShortcut } from "@/components/theme/ThemeShortcut";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Knit",
  title: {
    default: "Knit · Notas en markdown y tareas",
    template: "%s · Knit",
  },
  description:
    "Notas en markdown y una lista de tareas ligada a tus notas. Funciona sin cuenta y sin conexión; con cuenta, sincroniza entre dispositivos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Knit",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const themeScript = `try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script estático que evita el parpadeo del tema */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeShortcut />
        <SyncProvider />
        {children}
        <Toaster position="top-center" />
        <RegisterSW />
      </body>
    </html>
  );
}
