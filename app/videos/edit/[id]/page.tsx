import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditVideoItem } from "@/components/sections/videos/edit-video-item";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { getVideoCarouselCounts } from "@/lib/video-carousel-utils";

// Composant de chargement
function VideoEditLoading() {
  return (
    <div className="w-[90%] mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type Params = Promise<{ id: string }>;

export default function EditVideoPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<VideoEditLoading />}>
      <EditVideoContent params={params} />
    </Suspense>
  );
}

async function EditVideoContent({ params }: { params: Params }) {
  try {
    const { id } = await params;
    const videoId = parseInt(id);

    if (isNaN(videoId)) {
      return notFound();
    }

    // Exécuter les requêtes en parallèle avec Promise.all et utiliser select au lieu de include
    const [video, tags] = await Promise.all([
      // Optimiser la requête de vidéo
      prisma.videos.findUnique({
        where: {
          id_vid: videoId,
        },
        select: {
          id_vid: true,
          titre: true,
          description: true,
          lien: true,
          duree: true,
          date: true,
          afficher: true,
          afficher_carrousel_main: true,
          afficher_section_videos: true,
          tag_section_videos: true,
          videos_tags_link: {
            select: {
              videos_tags: {
                select: {
                  titre: true,
                },
              },
            },
          },
        },
      }),

      // Optimiser la requête de tags
      prisma.videos_tags.findMany({
        select: {
          id_tags: true,
          titre: true,
          important: true,
        },
        orderBy: {
          titre: "asc",
        },
      }),
    ]);

    if (!video) {
      return notFound();
    }

    // Extraire les tags de la vidéo de manière optimisée
    const videoTags = video.videos_tags_link.map(
      (link) => link.videos_tags.titre
    );

    // Convertir la date si elle existe
    const videoDate = video.date ? new Date(video.date) : undefined;

    // Récupérer le titre du tag de section si un ID est défini
    let tagSectionVideosTitle: string | null = null;
    if (video.tag_section_videos) {
      const sectionTag = await prisma.videos_tags.findUnique({
        where: { id_tags: video.tag_section_videos },
        select: { titre: true },
      });
      tagSectionVideosTitle = sectionTag?.titre || null;
    }

    // Transformer les tags pour le composant client
    const formattedTags = tags.map((tag) => ({
      id: tag.titre,
      label: tag.titre,
      important: Boolean(tag.important),
    }));

    // Préparer les données pour le composant client
    const initialData = {
      id_vid: video.id_vid,
      titre: video.titre,
      description: video.description,
      lien: video.lien,
      duree: video.duree,
      date: videoDate,
      afficher: video.afficher,
      afficher_carrousel_main: video.afficher_carrousel_main,
      afficher_section_videos: video.afficher_section_videos,
      tag_section_videos: tagSectionVideosTitle,
      tags: videoTags,
    };

    // Récupérer les compteurs des carrousels (exclure la vidéo courante)
    const carouselCounts = await getVideoCarouselCounts(videoId);

    return (
      <div className="w-[90%] mx-auto">
        <EditVideoItem
          initialData={initialData}
          availableTags={formattedTags}
          carouselCounts={carouselCounts}
        />
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la vidéo:", error);
    return (
      <div className="w-[90%] mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Une erreur est survenue lors du chargement des données. Veuillez
          réessayer ou contacter l'administrateur.
        </div>
      </div>
    );
  }
}
