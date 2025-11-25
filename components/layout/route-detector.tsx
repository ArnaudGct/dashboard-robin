"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useEffect } from "react";
import { User as UserType } from "@/types/user";

interface RouteDetectorProps {
  user: UserType | undefined;
  children: React.ReactNode;
}

export function RouteDetector({ user, children }: RouteDetectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname?.startsWith("/auth");

  // Debug pour voir les valeurs
  useEffect(() => {
    console.log("Current path:", pathname);
    console.log("Is auth page:", isAuthPage);
    console.log("User:", user);

    // Si l'utilisateur n'est pas connecté et n'est pas sur une page d'auth, rediriger
    if (!user && !isAuthPage) {
      console.log("User is undefined, redirecting to signin");
      router.push("/auth/signin");
    }
  }, [pathname, isAuthPage, user, router]);

  // Pages d'authentification : pas de sidebar
  if (isAuthPage) {
    return (
      <main className="flex items-center justify-center w-full min-h-screen">
        {children}
      </main>
    );
  }

  // Pages normales : avec sidebar si l'utilisateur est connecté
  if (!user) {
    // Afficher un loader pendant la redirection
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="w-full h-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
