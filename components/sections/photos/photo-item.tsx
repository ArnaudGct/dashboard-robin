"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  EyeOff,
  Check,
  ChevronsUpDown,
  Album,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/tag";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoFeaturedSections } from "./photo-featured-sections";
import {
  togglePhotoFeaturedAction,
  deleteMultiplePhotosAction,
} from "@/actions/photos-actions";
import { toast } from "sonner";

const PORTFOLIO_BASE_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "";

// Types pour les photos
type Photo = {
  id_pho: number;
  lien_high: string;
  lien_low: string;
  largeur: number;
  hauteur: number;
  alt: string;
  date: Date;
  afficher: boolean;
  afficher_carrousel_main: boolean;
  afficher_carrousel_photos: boolean;
  photos_tags_link: {
    id_tags: number;
    photos_tags: {
      id_tags: number;
      titre: string;
      important: boolean;
    };
  }[];
  photos_albums_link: {
    id_alb: number;
    photos_albums: {
      id_alb: number;
      titre: string;
    };
  }[];
};

type Album = {
  id_alb: number;
  titre: string;
};

type PhotosContainerProps = {
  photos: Photo[];
  albums: Album[];
};

// Composant principal qui combine la liste et les items
export function PhotoItem({ photos, albums }: PhotosContainerProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Filtrer les photos en fonction de l'album sélectionné
  const filteredPhotos = !selectedAlbumId
    ? photos // Si aucun album sélectionné, afficher toutes les photos
    : selectedAlbumId === "unassigned"
      ? photos.filter((photo) => photo.photos_albums_link.length === 0)
      : photos.filter((photo) =>
          photo.photos_albums_link.some(
            (link) => link.photos_albums.id_alb === parseInt(selectedAlbumId),
          ),
        );

  // Trouver l'album sélectionné pour l'affichage du titre
  const selectedAlbum =
    selectedAlbumId && selectedAlbumId !== "unassigned"
      ? albums.find((album) => album.id_alb.toString() === selectedAlbumId)
      : null;

  // Fonction pour la navigation vers l'édition
  const handlePhotoClick = (photoId: number) => {
    // Si on est en mode sélection, toggle la sélection au lieu de naviguer
    if (selectedPhotos.size > 0) {
      handlePhotoSelect(photoId, !selectedPhotos.has(photoId));
      return;
    }

    // Précharger l'image basse résolution avant la navigation
    const photo = photos.find((p) => p.id_pho === photoId);
    if (photo) {
      const img = new window.Image();
      img.src = getImageUrl(photo.lien_low);
    }

    router.push(`/photos/edit/${photoId}`);
  };

  // Fonction pour gérer la sélection/désélection d'une photo
  const handlePhotoSelect = (photoId: number, checked: boolean) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(photoId);
      } else {
        newSet.delete(photoId);
      }
      return newSet;
    });
  };

  // Fonction pour sélectionner/désélectionner toutes les photos
  const handleSelectAll = () => {
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map((p) => p.id_pho)));
    }
  };

  // Fonction pour annuler la sélection
  const handleCancelSelection = () => {
    setSelectedPhotos(new Set());
  };

  // Fonction pour supprimer les photos sélectionnées
  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const photoIds = Array.from(selectedPhotos);
      const result = await deleteMultiplePhotosAction(photoIds);

      if (result.success) {
        toast.success(result.message || "Photos supprimées avec succès");
        setSelectedPhotos(new Set());
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression des photos");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder-photo.jpg";

    if (path.startsWith("http")) {
      return path;
    }

    if (path.startsWith("/photos/") || path.startsWith("/uploads/")) {
      return `${PORTFOLIO_BASE_URL}${path}`;
    }

    return path;
  };

  // Fonction pour gérer le basculement des photos épinglées
  const handleToggleFeatured = async (
    photoId: number,
    section: "main" | "photos",
  ) => {
    const result = await togglePhotoFeaturedAction(photoId, section);
    if (result.success) {
      toast.success(
        section === "main"
          ? "Photo mise à jour pour le carrousel principal"
          : "Photo mise à jour pour la section photos",
      );
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  return (
    <section className="">
      <div className="flex flex-col gap-8">
        {/* Sections épinglées */}
        <PhotoFeaturedSections
          photos={photos}
          onToggleFeatured={handleToggleFeatured}
        />

        {/* Barre d'actions pour la sélection multiple */}
        {selectedPhotos.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">
                {selectedPhotos.size} photo
                {selectedPhotos.size !== 1 ? "s" : ""} sélectionnée
                {selectedPhotos.size !== 1 ? "s" : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSelection}
              >
                Annuler
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}

        {/* Combobox pour filtrer par album */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="w-[280px] justify-between cursor-pointer"
                >
                  {selectedAlbumId === "unassigned"
                    ? "Photos sans album"
                    : selectedAlbum
                      ? selectedAlbum.titre
                      : "Toutes les photos"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un album..." />
                  <CommandEmpty>Aucun album trouvé.</CommandEmpty>
                  <CommandList>
                    {albums.length > 0 && (
                      <CommandGroup>
                        {albums.map((album) => (
                          <CommandItem
                            key={album.id_alb}
                            onSelect={() => {
                              setSelectedAlbumId(
                                selectedAlbumId === album.id_alb.toString()
                                  ? null // Si on sélectionne le même album, on désélectionne et affiche toutes les photos
                                  : album.id_alb.toString(),
                              );
                              setIsPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAlbumId === album.id_alb.toString()
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {album.titre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {filteredPhotos.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedPhotos.size === filteredPhotos.length
                  ? "Tout désélectionner"
                  : "Tout sélectionner"}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredPhotos.length} photo
            {filteredPhotos.length !== 1 ? "s" : ""} trouvée
            {filteredPhotos.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Afficher les photos filtrées */}
        {filteredPhotos.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Aucune photo trouvée dans cette sélection
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => (
              <Card
                key={photo.id_pho}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow relative",
                  selectedPhotos.has(photo.id_pho) && "ring-2 ring-primary",
                )}
                onClick={() => handlePhotoClick(photo.id_pho)}
              >
                {/* Case à cocher */}
                <div
                  className="absolute top-2 left-2 z-10 p-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhotoSelect(
                      photo.id_pho,
                      !selectedPhotos.has(photo.id_pho),
                    );
                  }}
                >
                  <Checkbox
                    checked={selectedPhotos.has(photo.id_pho)}
                    onCheckedChange={(checked) => {
                      handlePhotoSelect(photo.id_pho, checked as boolean);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white border-2 border-gray-300 shadow-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary h-5 w-5"
                  />
                </div>

                <div className="flex flex-col px-6 gap-4">
                  <div
                    className="relative w-full rounded-lg overflow-hidden"
                    style={{
                      paddingTop: `${
                        (1 / (photo.largeur / photo.hauteur || 16 / 9)) * 100
                      }%`,
                    }}
                  >
                    <Image
                      src={getImageUrl(photo.lien_low)}
                      alt={photo.alt || "Photo"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center"
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-photo.jpg";
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {photo.photos_tags_link.length > 0 && (
                      <div className="flex gap-x-2 gap-y-1 items-center flex-wrap mt-2">
                        {photo.photos_tags_link.map((tagLink) => (
                          <Tag key={`tag-${tagLink.id_tags}`} variant="default">
                            {tagLink.photos_tags.titre}
                          </Tag>
                        ))}
                      </div>
                    )}
                    {/* 
                    {photo.photos_tags_recherche_link.length > 0 && (
                      <div className="flex gap-x-2 gap-y-1 items-center flex-wrap mt-1">
                        {photo.photos_tags_recherche_link.map((tagLink) => (
                          <Tag
                            key={`search-${tagLink.id_tags}`}
                            variant="outlined"
                          >
                            {tagLink.photos_tags_recherche.titre}
                          </Tag>
                        ))}
                      </div>
                    )} */}
                    {photo.photos_albums_link.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1">
                        {photo.photos_albums_link.map((albumLink) => (
                          <div
                            key={`album-${albumLink.id_alb}`}
                            className="flex gap-1 items-center text-muted-foreground"
                          >
                            <Album size={18} />
                            <p className="text-sm">
                              {albumLink.photos_albums.titre}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 items-center text-muted-foreground">
                      {photo.afficher ? (
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
            ))}
          </div>
        )}

        {/* Dialog de confirmation de suppression */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedPhotos.size} photo
                {selectedPhotos.size !== 1 ? "s" : ""} ? Cette action est
                irréversible et supprimera définitivement{" "}
                {selectedPhotos.size !== 1 ? "les photos" : "la photo"} ainsi
                que toutes leurs associations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
