"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOutilAction } from "@/actions/apropos_outils-actions";
import { Sketch } from "@uiw/react-color";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Palette,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

export function AddOutilItem() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [iconeRounded, setIconeRounded] = useState<boolean>(false);
  const [typeOutil, setTypeOutil] = useState<"simple" | "detaille">("detaille");

  // États pour les couleurs
  const [couleurFond, setCouleurFond] = useState("#ffffff");
  const [couleurTitre, setCouleurTitre] = useState("#000000");
  const [couleurDescription, setCouleurDescription] = useState("#666666");

  // États pour l'affichage des color pickers
  const [showColorPickers, setShowColorPickers] = useState({
    fond: false,
    titre: false,
    description: false,
  });

  const toggleColorPicker = (type: keyof typeof showColorPickers) => {
    setShowColorPickers((prev) => {
      const newState = {
        fond: false,
        titre: false,
        description: false,
      };

      // Si le picker actuel est fermé, on l'ouvre et ferme les autres
      if (!prev[type]) {
        newState[type] = true;
      }

      return newState;
    });
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Le fichier sélectionné n'est pas une image");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOutil = async (formData: FormData) => {
    setIsSubmitting(true);

    const titre = formData.get("titre")?.toString();
    const description = formData.get("description")?.toString();
    const iconeAlt = formData.get("icone_alt")?.toString();
    const lien = formData.get("lien")?.toString();

    if (!titre) {
      toast.error("Le titre est obligatoire.");
      setIsSubmitting(false);
      return;
    }

    if (typeOutil === "detaille" && !description?.trim()) {
      toast.error("La description est obligatoire pour un outil détaillé.");
      setIsSubmitting(false);
      return;
    }

    if (!iconeAlt?.trim()) {
      toast.error("Le texte alternatif de l'icône est obligatoire.");
      setIsSubmitting(false);
      return;
    }

    // Validation du lien si fourni
    if (lien && lien.trim() && !lien.startsWith("http")) {
      toast.error("Le lien doit commencer par http:// ou https://");
      setIsSubmitting(false);
      return;
    }

    // Ajouter les couleurs au FormData
    formData.set("type_outil", typeOutil);
    formData.set("couleur_fond", couleurFond);
    formData.set("couleur_titre", couleurTitre);
    formData.set("couleur_description", couleurDescription);

    // Ajouter le fichier d'icône si sélectionné
    if (selectedFile) {
      formData.append("icone", selectedFile);
    }

    // Ajouter les autres propriétés
    formData.set("icone_rounded", iconeRounded ? "true" : "false");
    formData.set("afficher", isPublished ? "true" : "false");

    const result = await createOutilAction(formData);

    if (result.success) {
      toast.success("Outil ajouté avec succès");
      router.push("/a-propos/outils");
      router.refresh();
    } else {
      toast.error(
        "Erreur lors de l'ajout: " + (result.message || "Erreur inconnue")
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/a-propos/outils">Outils</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ajouter un outil</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form className="flex flex-col gap-5" action={handleAddOutil}>
        <Tabs
          value={typeOutil}
          onValueChange={(value) =>
            setTypeOutil(value as "simple" | "detaille")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="cursor-pointer" value="detaille">
              Outil détaillé
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="simple">
              Outil simple
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="titre">Titre</Label>
          <Input
            id="titre"
            name="titre"
            placeholder="Nom de l'outil"
            required
          />
        </div>

        {typeOutil === "detaille" && (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Description de l'outil"
              rows={4}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="lien">Lien vers l'outil</Label>
          <Input
            id="lien"
            name="lien"
            type="url"
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="icone">Icône</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="icone"
                name="icone"
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="flex-1"
              />
            </div>
            {iconPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">
                  Aperçu de l'icône :
                </p>
                <Image
                  src={iconPreview}
                  alt="Aperçu icône"
                  width={64}
                  height={64}
                  className={`border ${iconeRounded ? "rounded-full" : "rounded-md"}`}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="icone_alt">Texte alternatif de l'icône</Label>
            <Input
              id="icone_alt"
              name="icone_alt"
              placeholder="Description de l'icône"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="icone_rounded"
            name="icone_rounded"
            checked={iconeRounded}
            onCheckedChange={setIconeRounded}
            className="cursor-pointer"
          />
          <Label htmlFor="icone_rounded">Icône arrondie</Label>
        </div>

        {/* Couleurs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {typeOutil === "simple" && (
              <div className="space-y-2">
                <Label>Couleur de fond</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border flex-shrink-0"
                    style={{ backgroundColor: couleurFond }}
                  />
                  <Input
                    type="text"
                    value={couleurFond}
                    onChange={(e) => setCouleurFond(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleColorPicker("fond")}
                    className="flex-shrink-0 cursor-pointer p-2"
                  >
                    {showColorPickers.fond ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {showColorPickers.fond && (
                  <div className="mt-2 p-2 border rounded-md bg-white shadow-lg relative z-10">
                    <div className="w-full max-w-xs mx-auto">
                      <Sketch
                        color={couleurFond}
                        onChange={(color) => setCouleurFond(color.hex)}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Couleur du titre</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border flex-shrink-0"
                  style={{ backgroundColor: couleurTitre }}
                />
                <Input
                  type="text"
                  value={couleurTitre}
                  onChange={(e) => setCouleurTitre(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 min-w-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleColorPicker("titre")}
                  className="flex-shrink-0 cursor-pointer p-2"
                >
                  {showColorPickers.titre ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {showColorPickers.titre && (
                <div className="mt-2 p-2 border rounded-md bg-white shadow-lg relative z-10">
                  <div className="w-full max-w-xs mx-auto">
                    <Sketch
                      color={couleurTitre}
                      onChange={(color) => setCouleurTitre(color.hex)}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {typeOutil === "detaille" && (
              <div className="space-y-2">
                <Label>Couleur de description</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border flex-shrink-0"
                    style={{ backgroundColor: couleurDescription }}
                  />
                  <Input
                    type="text"
                    value={couleurDescription}
                    onChange={(e) => setCouleurDescription(e.target.value)}
                    placeholder="#666666"
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleColorPicker("description")}
                    className="flex-shrink-0 cursor-pointer p-2"
                  >
                    {showColorPickers.description ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {showColorPickers.description && (
                  <div className="mt-2 p-2 border rounded-md bg-white shadow-lg relative z-10">
                    <div className="w-full max-w-xs mx-auto">
                      <Sketch
                        color={couleurDescription}
                        onChange={(color) => setCouleurDescription(color.hex)}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="afficher"
            name="afficher"
            checked={isPublished}
            onCheckedChange={setIsPublished}
            className="cursor-pointer"
          />
          <Label htmlFor="afficher">Afficher l'outil</Label>
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
            onClick={() => router.push("/a-propos/outils")}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
