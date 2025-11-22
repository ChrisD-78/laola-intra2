import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedLayout from "@/components/ProtectedLayout";
import { TaskProvider } from "@/contexts/TaskContext";
import { ChatNotificationProvider } from "@/contexts/ChatNotificationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LA OLA Intranet - Mitarbeiter Portal",
  description: "Intranet Portal für Mitarbeiter - laola.baederbook.de",
  icons: {
    apple: "/apple-touch-icon.png",
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
            <ChatNotificationProvider>
              <TaskProvider>
                <ProtectedLayout>
                  {children}
                </ProtectedLayout>
              </TaskProvider>
            </ChatNotificationProvider>
          </AuthProvider>
        </body>
    </html>
  );
}
