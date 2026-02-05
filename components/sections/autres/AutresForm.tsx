"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Pencil, X, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  updateGeneral,
  createReseauSocial,
  updateReseauSocial,
  deleteReseauSocial,
  createTagRole,
  updateTagRole,
  deleteTagRole,
  reorderReseauxSociaux,
  reorderTagsRoles,
} from "@/actions/autres-actions";

type GeneralData = {
  id_general: number;
  logo: string;
  email: string;
  localisation: string;
} | null;

type ReseauSocial = {
  id_contact: number;
  logo: string;
  nom: string;
  lien: string;
  nom_profil: string;
  ordre: number;
};

type TagRole = {
  id_tag_role: number;
  nom: string;
  ordre: number;
};

interface AutresFormProps {
  generalData: GeneralData;
  reseauxSociaux: ReseauSocial[];
  tagsRoles: TagRole[];
}

export function AutresForm({
  generalData,
  reseauxSociaux,
  tagsRoles,
}: AutresFormProps) {
  const router = useRouter();

  // États pour le général
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUpdatingGeneral, setIsUpdatingGeneral] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  // États pour les réseaux sociaux
  const [reseaux, setReseaux] = useState(reseauxSociaux);
  const [showAddReseauForm, setShowAddReseauForm] = useState(false);
  const [editingReseau, setEditingReseau] = useState<ReseauSocial | null>(null);
  const [reseauLogoPreview, setReseauLogoPreview] = useState<string | null>(
    null,
  );
  const [selectedReseauLogoFile, setSelectedReseauLogoFile] =
    useState<File | null>(null);

  // États pour les tags de rôles
  const [tags, setTags] = useState(tagsRoles);
  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRole | null>(null);

  // Gestionnaires pour le header
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Le fichier sélectionné n'est pas une image");
        return;
      }

      setSelectedLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingGeneral(true);

    try {
      const formData = new FormData();

      if (selectedLogoFile) {
        formData.append("logo", selectedLogoFile);
      }

      formData.set("email", (e.target as any).email.value);
      formData.set("localisation", (e.target as any).localisation.value);

      const result = await updateGeneral(formData);

      if (result.success) {
        toast.success(result.message);
        setLogoPreview(null);
        setSelectedLogoFile(null);

        const logoInput = document.getElementById("logo") as HTMLInputElement;
        if (logoInput) logoInput.value = "";
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des informations générales:",
        error,
      );
      toast.error("Erreur lors de la mise à jour des informations générales");
    } finally {
      setIsUpdatingGeneral(false);
    }
  };

  // Gestionnaires pour les réseaux sociaux
  const handleMoveReseauUp = async (index: number) => {
    if (index === 0) return;

    const newReseaux = [...reseaux];
    [newReseaux[index], newReseaux[index - 1]] = [
      newReseaux[index - 1],
      newReseaux[index],
    ];

    // Mettre à jour les ordres
    const updatedReseaux = newReseaux.map((reseau, idx) => ({
      ...reseau,
      ordre: idx,
    }));

    setReseaux(updatedReseaux);

    // Sauvegarder en base de données
    const result = await reorderReseauxSociaux(
      updatedReseaux.map((r) => ({ id_contact: r.id_contact, ordre: r.ordre })),
    );

    if (!result.success) {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setReseaux(reseauxSociaux);
    }
  };

  const handleMoveReseauDown = async (index: number) => {
    if (index === reseaux.length - 1) return;

    const newReseaux = [...reseaux];
    [newReseaux[index], newReseaux[index + 1]] = [
      newReseaux[index + 1],
      newReseaux[index],
    ];

    // Mettre à jour les ordres
    const updatedReseaux = newReseaux.map((reseau, idx) => ({
      ...reseau,
      ordre: idx,
    }));

    setReseaux(updatedReseaux);

    // Sauvegarder en base de données
    const result = await reorderReseauxSociaux(
      updatedReseaux.map((r) => ({ id_contact: r.id_contact, ordre: r.ordre })),
    );

    if (!result.success) {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setReseaux(reseauxSociaux);
    }
  };

  const handleReseauLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Le fichier sélectionné n'est pas une image");
        return;
      }

      setSelectedReseauLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setReseauLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReseauSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const result = await createReseauSocial(formData);

      if (result.success && result.data) {
        toast.success(result.message);
        // Ajouter le nouveau réseau à l'état local
        setReseaux([...reseaux, result.data]);
        setShowAddReseauForm(false);
        setReseauLogoPreview(null);
        setSelectedReseauLogoFile(null);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la création du réseau social:", error);
      toast.error("Erreur lors de la création du réseau social");
    }
  };

  const handleEditReseauSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const result = await updateReseauSocial(formData);

      if (result.success && result.data) {
        toast.success(result.message);
        // Mettre à jour le réseau dans l'état local
        setReseaux(
          reseaux.map((r) =>
            r.id_contact === result.data.id_contact ? result.data : r,
          ),
        );
        setEditingReseau(null);
        setReseauLogoPreview(null);
        setSelectedReseauLogoFile(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du réseau social:", error);
      toast.error("Erreur lors de la mise à jour du réseau social");
    }
  };

  const handleDeleteReseau = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce réseau social ?")) {
      return;
    }

    try {
      const result = await deleteReseauSocial(id);

      if (result.success) {
        toast.success(result.message);
        // Supprimer le réseau de l'état local
        setReseaux(reseaux.filter((r) => r.id_contact !== id));
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du réseau social:", error);
      toast.error("Erreur lors de la suppression du réseau social");
    }
  };

  // Gestionnaires pour les tags de rôles
  const handleMoveTagUp = async (index: number) => {
    if (index === 0) return;

    const newTags = [...tags];
    [newTags[index], newTags[index - 1]] = [newTags[index - 1], newTags[index]];

    // Mettre à jour les ordres
    const updatedTags = newTags.map((tag, idx) => ({
      ...tag,
      ordre: idx,
    }));

    setTags(updatedTags);

    // Sauvegarder en base de données
    const result = await reorderTagsRoles(
      updatedTags.map((t) => ({ id_tag_role: t.id_tag_role, ordre: t.ordre })),
    );

    if (!result.success) {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setTags(tagsRoles);
    }
  };

  const handleMoveTagDown = async (index: number) => {
    if (index === tags.length - 1) return;

    const newTags = [...tags];
    [newTags[index], newTags[index + 1]] = [newTags[index + 1], newTags[index]];

    // Mettre à jour les ordres
    const updatedTags = newTags.map((tag, idx) => ({
      ...tag,
      ordre: idx,
    }));

    setTags(updatedTags);

    // Sauvegarder en base de données
    const result = await reorderTagsRoles(
      updatedTags.map((t) => ({ id_tag_role: t.id_tag_role, ordre: t.ordre })),
    );

    if (!result.success) {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setTags(tagsRoles);
    }
  };

  const handleAddTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const result = await createTagRole(formData);

      if (result.success && result.data) {
        toast.success(result.message);
        // Ajouter le nouveau tag à l'état local
        setTags([...tags, result.data]);
        setShowAddTagForm(false);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la création du tag de rôle:", error);
      toast.error("Erreur lors de la création du tag de rôle");
    }
  };

  const handleEditTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const result = await updateTagRole(formData);

      if (result.success && result.data) {
        toast.success(result.message);
        // Mettre à jour le tag dans l'état local
        setTags(
          tags.map((t) =>
            t.id_tag_role === result.data.id_tag_role ? result.data : t,
          ),
        );
        setEditingTag(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du tag de rôle:", error);
      toast.error("Erreur lors de la mise à jour du tag de rôle");
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tag de rôle ?")) {
      return;
    }

    try {
      const result = await deleteTagRole(id);

      if (result.success) {
        toast.success(result.message);
        // Supprimer le tag de l'état local
        setTags(tags.filter((t) => t.id_tag_role !== id));
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du tag de rôle:", error);
      toast.error("Erreur lors de la suppression du tag de rôle");
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Général */}
      <Card className="p-6 gap-0">
        <h2 className="text-2xl font-bold mb-6">Général</h2>
        <form onSubmit={handleGeneralSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Logo */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>

              {generalData?.logo && !logoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Logo actuel :</p>
                  <div className="rounded-md overflow-hidden bg-muted w-32 h-32 relative">
                    <Image
                      src={generalData.logo}
                      alt="Logo actuel"
                      fill
                      className="object-contain"
                      sizes="128px"
                    />
                  </div>
                </div>
              )}

              {logoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Aperçu du nouveau logo :
                  </p>
                  <div className="rounded-md overflow-hidden bg-muted w-32 h-32 relative">
                    <Image
                      src={logoPreview}
                      alt="Aperçu du logo"
                      fill
                      className="object-contain"
                      sizes="128px"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email de contact */}
          <div className="space-y-2">
            <Label htmlFor="email">Email de contact</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@exemple.com"
              defaultValue={generalData?.email || "robin@cosmoseprod.com"}
              required
            />
          </div>

          {/* Localisation */}
          <div className="space-y-2">
            <Label htmlFor="localisation">Lieu de déplacement</Label>
            <Input
              id="localisation"
              name="localisation"
              type="text"
              placeholder="Ex: France, Europe"
              defaultValue={generalData?.localisation || ""}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isUpdatingGeneral}>
            {isUpdatingGeneral ? "Mise à jour en cours..." : "Mettre à jour"}
          </Button>
        </form>
      </Card>

      {/* Section Réseaux sociaux */}
      <Card className="p-6 gap-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Réseaux sociaux</h2>
          <Button
            onClick={() => setShowAddReseauForm(!showAddReseauForm)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un réseau
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddReseauForm && (
          <Card className="p-4 mb-6 bg-muted gap-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Ajouter un réseau social
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddReseauForm(false);
                  setReseauLogoPreview(null);
                  setSelectedReseauLogoFile(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleAddReseauSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_reseau_logo">Logo *</Label>
                  <Input
                    id="new_reseau_logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleReseauLogoChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Le logo doit être transparent (pas de fond plein).
                    Ressources :{" "}
                    <a
                      href="https://svgl.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      svgl.app
                    </a>{" "}
                    ou{" "}
                    <a
                      href="https://simpleicons.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      simpleicons.org
                    </a>
                  </p>
                  {reseauLogoPreview && (
                    <div className="mt-2">
                      <div className="rounded-md overflow-hidden bg-white w-20 h-20 relative">
                        <Image
                          src={reseauLogoPreview}
                          alt="Aperçu"
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_reseau_nom">Nom *</Label>
                  <Input
                    id="new_reseau_nom"
                    name="nom"
                    type="text"
                    placeholder="Ex: Instagram"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_reseau_lien">Lien du profil *</Label>
                  <Input
                    id="new_reseau_lien"
                    name="lien"
                    type="url"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_reseau_nom_profil">Nom du profil *</Label>
                  <Input
                    id="new_reseau_nom_profil"
                    name="nom_profil"
                    type="text"
                    placeholder="@username"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Créer le réseau social
              </Button>
            </form>
          </Card>
        )}

        {/* Liste des réseaux sociaux */}
        <div className="flex flex-wrap gap-4">
          {reseaux.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 w-full">
              Aucun réseau social configuré
            </p>
          ) : (
            reseaux
              .sort((a, b) => a.ordre - b.ordre)
              .map((reseau, index) => (
                <Card
                  key={reseau.id_contact}
                  className="p-4 w-full md:w-[calc(50%-0.5rem)] xl:w-[calc(33.33%-0.67rem)]"
                >
                  {editingReseau?.id_contact === reseau.id_contact ? (
                    <form
                      onSubmit={handleEditReseauSubmit}
                      className="space-y-4"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={reseau.id_contact}
                      />

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Logo</Label>
                          <Input
                            name="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleReseauLogoChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Le logo doit être transparent (pas de fond plein).
                            Ressources :{" "}
                            <a
                              href="https://svgl.app/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              svgl.app
                            </a>{" "}
                            ou{" "}
                            <a
                              href="https://simpleicons.org/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              simpleicons.org
                            </a>
                          </p>
                          <div className="mt-2">
                            <div className="rounded-md overflow-hidden bg-muted w-20 h-20 relative">
                              <Image
                                src={reseauLogoPreview || reseau.logo}
                                alt="Logo"
                                fill
                                className="object-contain"
                                sizes="80px"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Nom</Label>
                          <Input
                            name="nom"
                            type="text"
                            defaultValue={reseau.nom}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Lien du profil</Label>
                          <Input
                            name="lien"
                            type="url"
                            defaultValue={reseau.lien}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Nom du profil</Label>
                          <Input
                            name="nom_profil"
                            type="text"
                            defaultValue={reseau.nom_profil}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Enregistrer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingReseau(null);
                            setReseauLogoPreview(null);
                            setSelectedReseauLogoFile(null);
                          }}
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md overflow-hidden bg-muted w-12 h-12 relative flex-shrink-0">
                            <Image
                              src={reseau.logo}
                              alt={reseau.nom}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{reseau.nom}</p>
                            <p className="text-sm text-muted-foreground">
                              {reseau.nom_profil}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex gap-0 items-center mr-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveReseauUp(index)}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveReseauDown(index)}
                              disabled={index === reseaux.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingReseau(reseau)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleDeleteReseau(reseau.id_contact)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <a
                        href={reseau.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate"
                      >
                        {reseau.lien}
                      </a>
                    </div>
                  )}
                </Card>
              ))
          )}
        </div>
      </Card>

      {/* Section Tags de rôles */}
      <Card className="p-6 gap-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tags de rôles</h2>
          <Button
            onClick={() => setShowAddTagForm(!showAddTagForm)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un tag
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddTagForm && (
          <Card className="p-4 mb-6 bg-muted gap-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter un tag de rôle</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddTagForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleAddTagSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_tag_nom">Nom du rôle *</Label>
                  <Input
                    id="new_tag_nom"
                    name="nom"
                    type="text"
                    placeholder="Ex: Monteur vidéo"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Créer le tag de rôle
              </Button>
            </form>
          </Card>
        )}

        {/* Liste des tags de rôles */}
        <div className="flex flex-wrap gap-4">
          {tags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 w-full">
              Aucun tag de rôle configuré
            </p>
          ) : (
            tags
              .sort((a, b) => a.ordre - b.ordre)
              .map((tag, index) => (
                <Card
                  key={tag.id_tag_role}
                  className="p-4 w-auto min-w-[200px]"
                >
                  {editingTag?.id_tag_role === tag.id_tag_role ? (
                    <form onSubmit={handleEditTagSubmit} className="space-y-4">
                      <input type="hidden" name="id" value={tag.id_tag_role} />

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Nom du rôle</Label>
                          <Input
                            name="nom"
                            type="text"
                            defaultValue={tag.nom}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Enregistrer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingTag(null)}
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-lg">{tag.nom}</p>

                      <div className="flex items-center gap-1">
                        <div className="flex gap-0 items-center mr-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleMoveTagUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleMoveTagDown(index)}
                            disabled={index === tags.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingTag(tag)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTag(tag.id_tag_role)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
          )}
        </div>
      </Card>
    </div>
  );
}
