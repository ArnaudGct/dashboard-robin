"use server";

import prisma from "@/lib/prisma";

const CAROUSEL_MAIN_LIMIT = 6;
const CAROUSEL_PHOTOS_LIMIT = 12;

/**
 * Récupère le nombre de photos déjà mises en avant dans chaque carrousel
 * @param excludePhotoId - ID de la photo à exclure du comptage (pour l'édition)
 */
export async function getCarouselCounts(excludePhotoId?: number) {
  const mainCount = await prisma.photos.count({
    where: {
      afficher_carrousel_main: true,
      ...(excludePhotoId && { id_pho: { not: excludePhotoId } }),
    },
  });

  const photosCount = await prisma.photos.count({
    where: {
      afficher_carrousel_photos: true,
      ...(excludePhotoId && { id_pho: { not: excludePhotoId } }),
    },
  });

  return {
    mainCount,
    mainLimit: CAROUSEL_MAIN_LIMIT,
    mainRemaining: CAROUSEL_MAIN_LIMIT - mainCount,
    photosCount,
    photosLimit: CAROUSEL_PHOTOS_LIMIT,
    photosRemaining: CAROUSEL_PHOTOS_LIMIT - photosCount,
  };
}
