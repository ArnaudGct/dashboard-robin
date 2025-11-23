"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import {
  updateClientAction,
  deleteClientAction,
} from "@/actions/accueil_clients-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";

interface EditClientFormProps {
  initialData: {
    id_client: number;
    client: string;
    afficher: boolean;
    logo?: string | null;
    alt_logo?: string | null;
  };
}

export function EditClientItem({ initialData }: EditClientFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    setIsUpdating(true);

    const result = await updateClientAction(formData);
    if (result.success) {
      toast.success("Témoignage mis à jour !");
      router.push("/accueil/clients");
      router.refresh();
    } else {
      toast.error(result.error || "Une erreur est survenue.");
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteClientAction(initialData.id_client);
    if (result.success) {
      toast.success("Témoignage supprimé !");
      router.push("/accueil/clients");
      router.refresh();
    } else {
      toast.error(result.error || "Une erreur est survenue.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/accueil/clients">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Modifier</BreadcrumbPage>
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
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form action={handleUpdate} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={initialData.id_client} />
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="client">Nom du client</Label>
          <Input
            type="text"
            id="client"
            name="client"
            defaultValue={initialData.client}
            required
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="alt_logo">Alt du logo</Label>
          <Input
            type="text"
            id="alt_logo"
            name="alt_logo"
            defaultValue={
              initialData.alt_logo || `Logo de ${initialData.client}`
            }
            required
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="logo">Logo du client</Label>
          <Input type="file" id="logo" name="logo" accept="image/*" />
          {initialData.logo && (
            <div className="mt-2">
              <Image
                src={initialData.logo}
                alt={initialData.alt_logo || `Logo de ${initialData.client}`}
                width={80}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="afficher"
            name="afficher"
            defaultChecked={initialData.afficher}
            className="cursor-pointer"
          />
          <Label htmlFor="afficher">Afficher le client</Label>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isUpdating}
            className="cursor-pointer"
          >
            {isUpdating ? "Mise à jour..." : "Mettre à jour"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.back()}
            disabled={isUpdating}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
