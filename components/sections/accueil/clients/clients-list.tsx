"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ClientItem } from "./client-item";
import { reorderClientsAction } from "@/actions/accueil_clients-actions";
import { toast } from "sonner";

type Client = {
  id_client: number;
  client: string;
  logo: string;
  alt_logo: string;
  lien_client: string;
  ordre: number;
  afficher: boolean;
};

interface ClientsListProps {
  initialClients: Client[];
}

export function ClientsList({ initialClients }: ClientsListProps) {
  const [clients, setClients] = useState(initialClients);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newClients = [...clients];
    [newClients[index], newClients[index - 1]] = [
      newClients[index - 1],
      newClients[index],
    ];

    // Mettre à jour les ordres
    const updatedClients = newClients.map((client, idx) => ({
      ...client,
      ordre: idx,
    }));

    setClients(updatedClients);

    // Sauvegarder en base de données
    const result = await reorderClientsAction(
      updatedClients.map((c) => ({ id_client: c.id_client, ordre: c.ordre }))
    );

    if (result.success) {
      toast.success("Ordre mis à jour");
    } else {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setClients(initialClients);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === clients.length - 1) return;

    const newClients = [...clients];
    [newClients[index], newClients[index + 1]] = [
      newClients[index + 1],
      newClients[index],
    ];

    // Mettre à jour les ordres
    const updatedClients = newClients.map((client, idx) => ({
      ...client,
      ordre: idx,
    }));

    setClients(updatedClients);

    // Sauvegarder en base de données
    const result = await reorderClientsAction(
      updatedClients.map((c) => ({ id_client: c.id_client, ordre: c.ordre }))
    );

    if (result.success) {
      toast.success("Ordre mis à jour");
    } else {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setClients(initialClients);
    }
  };

  if (clients.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Aucun client trouvé</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {clients.map((client, index) => (
        <ClientItem
          key={client.id_client}
          client={client}
          isFirst={index === 0}
          isLast={index === clients.length - 1}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
        />
      ))}
    </div>
  );
}
