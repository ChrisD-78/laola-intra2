import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedLayout from "@/components/ProtectedLayout";
import { TaskProvider } from "@/contexts/TaskContext";
import { ChatNotificationProvider } from "@/contexts/ChatNotificationContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LA OLA Intranet - Mitarbeiter Portal",
  description: "Intranet Portal für Mitarbeiter - laola.baederbook.de",
  manifest: "/site.webmanifest",
  themeColor: "#667eea",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
        <body className={inter.className}>
          <AuthProvider>
            <SidebarProvider>
              <ChatNotificationProvider>
                <TaskProvider>
                  <ProtectedLayout>
                    {children}
                  </ProtectedLayout>
                </TaskProvider>
              </ChatNotificationProvider>
            </SidebarProvider>
          </AuthProvider>
        </body>
    </html>
  );
}
