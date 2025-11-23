"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PORTFOLIO_BASE_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "";

const MAX_MAIN_CAROUSEL = 6;
const MAX_PHOTOS_CAROUSEL = 12;

type Photo = {
  id_pho: number;
  lien_high: string;
  lien_low: string;
  largeur: number;
  hauteur: number;
  alt: string;
  afficher_carrousel_main: boolean;
  afficher_carrousel_photos: boolean;
};

type PhotoFeaturedSectionsProps = {
  photos: Photo[];
  onToggleFeatured: (
    photoId: number,
    section: "main" | "photos"
  ) => Promise<void>;
};

export function PhotoFeaturedSections({
  photos,
  onToggleFeatured,
}: PhotoFeaturedSectionsProps) {
  const [isAddingMain, setIsAddingMain] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [loadingPhotoId, setLoadingPhotoId] = useState<number | null>(null);

  const mainCarouselPhotos = photos.filter((p) => p.afficher_carrousel_main);
  const photosCarouselPhotos = photos.filter(
    (p) => p.afficher_carrousel_photos
  );
  const availableForMain = photos.filter((p) => !p.afficher_carrousel_main);
  const availableForPhotos = photos.filter((p) => !p.afficher_carrousel_photos);

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder-photo.jpg";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/photos/") || path.startsWith("/uploads/")) {
      return `${PORTFOLIO_BASE_URL}${path}`;
    }
    return path;
  };

  const handleToggle = async (photoId: number, section: "main" | "photos") => {
    setLoadingPhotoId(photoId);
    try {
      await onToggleFeatured(photoId, section);
    } finally {
      setLoadingPhotoId(null);
      if (section === "main") setIsAddingMain(false);
      if (section === "photos") setIsAddingPhotos(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Carrousel Principal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              Carrousel principal (Accueil)
            </h3>
            <p className="text-sm text-muted-foreground">
              {mainCarouselPhotos.length} / {MAX_MAIN_CAROUSEL} photo
              {mainCarouselPhotos.length !== 1 ? "s" : ""} épinglée
              {mainCarouselPhotos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingMain(!isAddingMain)}
            className="cursor-pointer"
            disabled={mainCarouselPhotos.length >= MAX_MAIN_CAROUSEL}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {isAddingMain && availableForMain.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">
              Sélectionner une photo à ajouter :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[500px] overflow-y-auto">
              {availableForMain.map((photo) => (
                <button
                  key={photo.id_pho}
                  onClick={() => handleToggle(photo.id_pho, "main")}
                  disabled={loadingPhotoId === photo.id_pho}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer",
                    loadingPhotoId === photo.id_pho && "opacity-50"
                  )}
                >
                  <Image
                    src={getImageUrl(photo.lien_low)}
                    alt={photo.alt || "Photo"}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {mainCarouselPhotos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucune photo épinglée dans cette section
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mainCarouselPhotos.map((photo) => (
              <div key={photo.id_pho} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(photo.lien_low)}
                    alt={photo.alt || "Photo"}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleToggle(photo.id_pho, "main")}
                  disabled={loadingPhotoId === photo.id_pho}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section Page Photos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              Carrousel photos (Accueil)
            </h3>
            <p className="text-sm text-muted-foreground">
              {photosCarouselPhotos.length} / {MAX_PHOTOS_CAROUSEL} photo
              {photosCarouselPhotos.length !== 1 ? "s" : ""} épinglée
              {photosCarouselPhotos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingPhotos(!isAddingPhotos)}
            className="cursor-pointer"
            disabled={photosCarouselPhotos.length >= MAX_PHOTOS_CAROUSEL}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {isAddingPhotos && availableForPhotos.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">
              Sélectionner une photo à ajouter :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[500px] overflow-y-auto">
              {availableForPhotos.map((photo) => (
                <button
                  key={photo.id_pho}
                  onClick={() => handleToggle(photo.id_pho, "photos")}
                  disabled={loadingPhotoId === photo.id_pho}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer",
                    loadingPhotoId === photo.id_pho && "opacity-50"
                  )}
                >
                  <Image
                    src={getImageUrl(photo.lien_low)}
                    alt={photo.alt || "Photo"}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {photosCarouselPhotos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucune photo épinglée dans cette section
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photosCarouselPhotos.map((photo) => (
              <div key={photo.id_pho} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(photo.lien_low)}
                    alt={photo.alt || "Photo"}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleToggle(photo.id_pho, "photos")}
                  disabled={loadingPhotoId === photo.id_pho}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
