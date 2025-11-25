"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignOutPage() {
  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Déconnexion réussie !");
              window.location.href = "/auth/signin";
            },
            onError: () => {
              toast.error("Erreur lors de la déconnexion");
              window.location.href = "/";
            },
          },
        });
      } catch (error) {
        console.error("Error signing out:", error);
        toast.error("Erreur lors de la déconnexion");
        window.location.href = "/";
      }
    };

    handleSignOut();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Déconnexion en cours...</h1>
        <p className="text-muted-foreground">Veuillez patienter</p>
      </div>
    </div>
  );
}
