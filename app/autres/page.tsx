import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { AutresForm } from "@/components/sections/autres/AutresForm";

// Composant de chargement pour Suspense
function AutresLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 animate-pulse">
        <div className="space-y-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </Card>
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </Card>
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </Card>
    </div>
  );
}

export const revalidate = 60; // Revalidation des données toutes les 60 secondes

export default function Autres() {
  return (
    <section className="w-[90%] mx-auto mb-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-start">
          <p className="text-3xl font-bold">Autres</p>
        </div>

        {/* Utiliser Suspense pour le chargement asynchrone */}
        <Suspense fallback={<AutresLoading />}>
          <AutresList />
        </Suspense>
      </div>
    </section>
  );
}

async function AutresList() {
  // Récupérer les données générales
  const generalData = await prisma.autres_general.findFirst();

  // Récupérer tous les réseaux sociaux de la table contact
  const contactData = await prisma.autres_contact.findMany({
    orderBy: { ordre: "asc" },
  });

  // Tous les éléments avec un logo sont des réseaux sociaux
  const reseauxSociaux: Array<{
    id_contact: number;
    logo: string;
    nom: string;
    lien: string;
    nom_profil: string;
    ordre: number;
  }> = [];

  // Parcourir les données et extraire uniquement les réseaux sociaux
  for (const item of contactData) {
    if (item.logo && item.nom && item.lien && item.nom_profil) {
      reseauxSociaux.push({
        id_contact: item.id_contact,
        logo: item.logo,
        nom: item.nom,
        lien: item.lien,
        nom_profil: item.nom_profil,
        ordre: item.ordre ?? 0,
      });
    }
  }

  // Récupérer tous les tags de rôles
  const tagsRoles = await prisma.autres_tags_roles.findMany({
    orderBy: { ordre: "asc" },
  });

  return (
    <AutresForm
      generalData={generalData}
      reseauxSociaux={reseauxSociaux}
      tagsRoles={tagsRoles}
    />
  );
}
