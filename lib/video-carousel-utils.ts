"use server";

import prisma from "@/lib/prisma";

const CAROUSEL_MAIN_LIMIT = 6;
const SECTION_VIDEOS_LIMIT = 6;

/**
 * Récupère le nombre de vidéos déjà mises en avant dans le carrousel principal et la section vidéos
 * @param excludeVideoId - ID de la vidéo à exclure du comptage (pour l'édition)
 */
export async function getVideoCarouselCounts(excludeVideoId?: number) {
  const [mainCount, videosCount] = await Promise.all([
    prisma.videos.count({
      where: {
        afficher_carrousel_main: true,
        ...(excludeVideoId && { id_vid: { not: excludeVideoId } }),
      },
    }),
    prisma.videos.count({
      where: {
        afficher_section_videos: true,
        ...(excludeVideoId && { id_vid: { not: excludeVideoId } }),
      },
    }),
  ]);

  return {
    mainCount,
    mainLimit: CAROUSEL_MAIN_LIMIT,
    mainRemaining: CAROUSEL_MAIN_LIMIT - mainCount,
    videosCount,
    videosLimit: SECTION_VIDEOS_LIMIT,
    videosRemaining: SECTION_VIDEOS_LIMIT - videosCount,
  };
}

/**
 * Récupère les vidéos qui ont un tag pour la section vidéos
 */
export async function getVideosWithSectionTags() {
  return await prisma.videos.findMany({
    where: {
      tag_section_videos: {
        not: null,
      },
    },
    select: {
      id_vid: true,
      titre: true,
      tag_section_videos: true,
    },
  });
}
