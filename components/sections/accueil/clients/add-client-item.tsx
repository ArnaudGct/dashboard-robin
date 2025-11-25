"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { addClientAction } from "@/actions/accueil_clients-actions";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AddClientItem() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    if (selectedDate) {
      formData.set("date", format(selectedDate, "yyyy-MM-dd"));
    } else {
      formData.delete("date");
    }

    const result = await addClientAction(formData);
    if (result.success) {
      toast.success("Client ajouté avec succès !");
      router.push("/accueil/clients");
      router.refresh();
    } else {
      toast.error(result.error || "Une erreur est survenue.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/accueil/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ajouter un client</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form action={handleSubmit} className="flex flex-col gap-5">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="client">Nom du client</Label>
          <Input type="text" id="client" name="client" required />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="alt_logo">Alt du logo</Label>
          <Input type="text" id="alt_logo" name="alt_logo" required />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="lien_client">Lien du site du client</Label>
          <Input
            type="url"
            id="lien_client"
            name="lien_client"
            placeholder="https://exemple.com"
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="logo">Logo du client</Label>
          <Input type="file" id="logo" name="logo" accept="image/*" />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="afficher" name="afficher" defaultChecked />
          <Label htmlFor="afficher">Afficher le client</Label>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
