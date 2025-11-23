import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { ExperienceItem } from "@/components/sections/a-propos/experiences/experience-item";

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const experiences = await prisma.apropos_experiences.findMany({
    orderBy: {
      date_debut: "desc",
    },
  });

  return (
    <div className="w-[90%] mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-center items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-3xl font-bold">Expériences professionnelles</h1>
          <Link href="/a-propos/experiences/add">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une expérience
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {experiences.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune expérience pour le moment.</p>
              <p className="text-sm mt-2">
                Cliquez sur "Ajouter une expérience" pour commencer.
              </p>
            </div>
          ) : (
            experiences.map((experience) => (
              <ExperienceItem key={experience.id_exp} experience={experience} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
