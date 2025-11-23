"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { addExperienceAction } from "@/actions/a-propos_experiences-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Checkbox } from "@/components/ui/checkbox";

export function AddExperience() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateDebut, setDateDebut] = useState<Date | undefined>(new Date());
  const [dateFin, setDateFin] = useState<Date | undefined>(undefined);
  const [isEnCours, setIsEnCours] = useState(true);

  const handleAddExperience = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      // Gérer les dates
      if (dateDebut) {
        const year = dateDebut.getFullYear();
        const month = dateDebut.getMonth() + 1;
        const day = dateDebut.getDate();

        if (year > 0 && month > 0 && day > 0) {
          const formattedDate = format(dateDebut, "yyyy-MM-dd");
          formData.set("date_debut", formattedDate);
        } else {
          formData.delete("date_debut");
        }
      }

      if (isEnCours) {
        formData.set("date_fin", "en_cours");
      } else if (dateFin) {
        const year = dateFin.getFullYear();
        const month = dateFin.getMonth() + 1;
        const day = dateFin.getDate();

        if (year > 0 && month > 0 && day > 0) {
          const formattedDate = format(dateFin, "yyyy-MM-dd");
          formData.set("date_fin", formattedDate);
        } else {
          formData.delete("date_fin");
        }
      }

      // Vérifier si on a au moins un titre et une entreprise
      const titre = formData.get("titre")?.toString();
      const nomEntreprise = formData.get("nom_entreprise")?.toString();

      if (!titre || !nomEntreprise) {
        toast.error("Le titre et le nom de l'entreprise sont obligatoires");
        return;
      }

      const result = await addExperienceAction(formData);

      if (result.success) {
        toast.success("Expérience ajoutée avec succès");
        router.push("/a-propos/experiences");
        router.refresh();
      } else {
        toast.error(
          "Erreur lors de l'ajout: " + (result.error || "Erreur inconnue")
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Erreur lors de l'ajout de l'expérience");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[90%] mx-auto">
      <div className="flex flex-col gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/a-propos/experiences">
                Expériences
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Ajouter une expérience</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <form className="flex flex-col gap-5" action={handleAddExperience}>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="titre">Titre du poste</Label>
            <Input
              type="text"
              id="titre"
              name="titre"
              placeholder="Ex: Réalisateur audiovisuel"
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="nom_entreprise">Nom de l'entreprise</Label>
            <Input
              type="text"
              id="nom_entreprise"
              name="nom_entreprise"
              placeholder="Ex: TV7"
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="lien_entreprise">
              Lien du site de l'entreprise
            </Label>
            <Input
              type="url"
              id="lien_entreprise"
              name="lien_entreprise"
              placeholder="Ex: https://www.sudouest.fr/lachainetv7/"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="date_debut">Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal cursor-pointer",
                    !dateDebut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateDebut ? (
                    format(dateDebut, "d MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateDebut}
                  onSelect={setDateDebut}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="en_cours"
              checked={isEnCours}
              onCheckedChange={(checked) => setIsEnCours(checked as boolean)}
              className="cursor-pointer"
            />
            <Label htmlFor="en_cours" className="cursor-pointer">
              Poste actuellement occupé
            </Label>
          </div>

          {!isEnCours && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="date_fin">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cursor-pointer",
                      !dateFin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFin ? (
                      format(dateFin, "d MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={setDateFin}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="afficher"
              name="afficher"
              defaultChecked
              className="cursor-pointer"
            />
            <Label htmlFor="afficher">Afficher</Label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Ajout en cours..." : "Ajouter"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push("/a-propos/experiences")}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
