"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateEtudeAction, deleteEtudeAction } from "@/actions/etudes-actions";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface EditEtudeProps {
  initialData: {
    id_etu: number;
    date_debut: Date;
    date_fin: Date | null;
    titre: string;
    nom_ecole: string;
    lien_ecole: string;
    afficher: boolean;
  };
}

export function EditEtude({ initialData }: EditEtudeProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    initialData.date_debut ? new Date(initialData.date_debut) : new Date()
  );
  const [dateFin, setDateFin] = useState<Date | undefined>(
    initialData.date_fin ? new Date(initialData.date_fin) : undefined
  );
  const [isEnCours, setIsEnCours] = useState(!initialData.date_fin);
  const [isPublished, setIsPublished] = useState<boolean>(initialData.afficher);

  const handleUpdateEtude = async (formData: FormData) => {
    try {
      setIsUpdating(true);

      // Ajouter l'ID
      formData.set("id", initialData.id_etu.toString());

      // Gérer les dates
      if (dateDebut) {
        const year = dateDebut.getFullYear();
        const month = dateDebut.getMonth() + 1;
        const day = dateDebut.getDate();

        if (year > 0 && month > 0 && day > 0) {
          const formattedMonth = month.toString().padStart(2, "0");
          const formattedDay = day.toString().padStart(2, "0");
          const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
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
          const formattedMonth = month.toString().padStart(2, "0");
          const formattedDay = day.toString().padStart(2, "0");
          const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
          formData.set("date_fin", formattedDate);
        } else {
          formData.delete("date_fin");
        }
      }

      // État de publication
      formData.set("afficher", isPublished ? "on" : "off");

      // Vérifier si on a au moins un titre et une école
      const titre = formData.get("titre")?.toString();
      const nomEcole = formData.get("nom_ecole")?.toString();

      if (!titre || !nomEcole) {
        toast.error("Le titre et le nom de l'école sont obligatoires");
        return;
      }

      const result = await updateEtudeAction(formData);

      if (result && result.success) {
        toast.success("Étude mise à jour avec succès");
        router.push("/a-propos/etudes");
        router.refresh();
      } else {
        toast.error(
          "Erreur lors de la mise à jour: " +
            (result?.error || "Erreur inconnue")
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour de l'étude");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEtude = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteEtudeAction(initialData.id_etu);

      if (result && result.success) {
        toast.success("Étude supprimée avec succès");
        router.push("/a-propos/etudes");
        router.refresh();
      } else {
        toast.error("Erreur lors de la suppression");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'étude");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-center items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/a-propos/etudes">Études</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Modifier l'étude</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="cursor-pointer">
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L'étude sera définitivement
                supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEtude}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form className="flex flex-col gap-5" action={handleUpdateEtude}>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="titre">Titre de la formation</Label>
          <Input
            type="text"
            id="titre"
            name="titre"
            defaultValue={initialData.titre}
            placeholder="Ex: Études de cinéma"
            required
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="nom_ecole">Nom de l'école</Label>
          <Input
            type="text"
            id="nom_ecole"
            name="nom_ecole"
            defaultValue={initialData.nom_ecole}
            placeholder="Ex: 3IS"
            required
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="lien_ecole">Lien du site de l'école</Label>
          <Input
            type="url"
            id="lien_ecole"
            name="lien_ecole"
            defaultValue={initialData.lien_ecole}
            placeholder="Ex: https://www.3is.fr"
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
            Formation en cours
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
            checked={isPublished}
            onCheckedChange={setIsPublished}
            className="cursor-pointer"
          />
          <Label htmlFor="afficher">Afficher</Label>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={isUpdating}
          >
            {isUpdating ? "Mise à jour..." : "Mettre à jour"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push("/a-propos/etudes")}
            disabled={isUpdating}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
