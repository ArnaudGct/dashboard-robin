import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { getOutils } from "@/actions/apropos_outils-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { OutilsList } from "@/components/sections/a-propos/outils/outils-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Composant de chargement
function OutilsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mt-4" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default async function AProposOutils() {
  const outils = await getOutils();

  return (
    <section className="w-[90%] mx-auto mb-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center justify-between">
          <h1 className="text-3xl font-bold">Outils</h1>
          <Link href="/a-propos/outils/add">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un outil
            </Button>
          </Link>
        </div>

        <OutilsList initialOutils={outils} />
      </div>
    </section>
  );
}
