import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Suspense, use } from "react";
import prisma from "@/lib/prisma";
import { ClientItem } from "@/components/sections/accueil/clients/client-item";

// Composant de chargement pour Suspense
function ClientsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6 animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export const revalidate = 60; // Revalidation des données toutes les 60 secondes

async function fetchClients() {
  try {
    return await prisma.clients.findMany({
      orderBy: {
        id_client: "desc",
      },
    });
  } catch (error) {
    console.error("Erreur lors du chargement des clients:", error);
    throw new Error("Erreur lors du chargement des clients");
  }
}

function ClientsList() {
  const clients = use(fetchClients());

  if (clients.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Aucun client trouvé</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {clients.map((client) => (
        <ClientItem key={client.id_client} client={client} />
      ))}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <section className="w-[90%] mx-auto mb-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center justify-between">
          <h1 className="text-3xl font-bold">Clients</h1>
          <Link href="/accueil/clients/add">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un client
            </Button>
          </Link>
        </div>

        <Suspense fallback={<ClientsLoading />}>
          <ClientsList />
        </Suspense>
      </div>
    </section>
  );
}
