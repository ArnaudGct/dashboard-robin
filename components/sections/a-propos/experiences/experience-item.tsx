"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Calendar, ExternalLink, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ExperienceItemProps = {
  experience: {
    id_exp: number;
    date_debut: Date;
    date_fin: Date | null;
    titre: string;
    nom_entreprise: string;
    lien_entreprise: string;
    afficher: boolean;
  };
};

export function ExperienceItem({ experience }: ExperienceItemProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/a-propos/experiences/edit/${experience.id_exp}`);
  };

  const formatPeriode = () => {
    const debut = format(new Date(experience.date_debut), "MMMM yyyy", {
      locale: fr,
    });
    const fin = experience.date_fin
      ? format(new Date(experience.date_fin), "MMMM yyyy", { locale: fr })
      : "Aujourd'hui";
    return `${debut} - ${fin}`;
  };

  return (
    <Card
      className="w-full cursor-pointer hover:shadow-md transition-all"
      onClick={handleCardClick}
    >
      <div className="flex flex-col justify-center xl:justify-start items-start gap-4 p-6">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xl font-semibold">{experience.titre}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-muted-foreground">
            <p className="text-base font-medium">{experience.nom_entreprise}</p>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              <span>{formatPeriode()}</span>
            </div>
          </div>

          {experience.lien_entreprise && (
            <a
              href={experience.lien_entreprise}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-primary hover:underline w-fit"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Voir le site de l'entreprise</span>
            </a>
          )}
        </div>

        <div className="flex justify-between items-center w-full mt-2">
          <div className="flex gap-1 items-center text-muted-foreground">
            {experience.afficher ? (
              <>
                <Eye size={18} />
                <p className="text-sm">Visible</p>
              </>
            ) : (
              <>
                <EyeOff size={18} />
                <p className="text-sm">Non visible</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
