import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { EtudeItem } from "@/components/sections/a-propos/etudes/etude-item";

export const dynamic = "force-dynamic";

export default async function EtudesPage() {
  const etudes = await prisma.apropos_etudes.findMany({
    orderBy: {
      date_debut: "desc",
    },
  });

  return (
    <div className="w-[90%] mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-center items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-3xl font-bold">Études</h1>
          <Link href="/a-propos/etudes/add">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une étude
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {etudes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune étude pour le moment.</p>
              <p className="text-sm mt-2">
                Cliquez sur "Ajouter une étude" pour commencer.
              </p>
            </div>
          ) : (
            etudes.map((etude) => (
              <EtudeItem key={etude.id_etu} etude={etude} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
