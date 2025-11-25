import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { RouteDetector } from "@/components/layout/route-detector";
import { getUser } from "@/lib/auth-session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard - CosmoseProd",
  description:
    "Espace privé pour gérer les données du portfolio de Arnaud Graciet",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const sanitizedUser = user
    ? {
        ...user,
        createdAt:
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : String(user.createdAt),
        updatedAt:
          user.updatedAt instanceof Date
            ? user.updatedAt.toISOString()
            : String(user.updatedAt),
      }
    : undefined;

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <RouteDetector user={sanitizedUser}>{children}</RouteDetector>
      </body>
    </html>
  );
}
