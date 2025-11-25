"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

// Fonction utilitaire pour extraire l'ID YouTube d'un lien ou retourner l'ID tel quel
function extractYouTubeId(urlOrId: string): string {
  // Si c'est déjà un ID court (pas de protocole), le retourner tel quel
  if (!urlOrId.includes("http") && !urlOrId.includes("/")) {
    return urlOrId.trim();
  }

  // Patterns pour différents formats de liens YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/v\/)([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Si aucun pattern ne correspond, retourner la valeur telle quelle
  return urlOrId.trim();
}

export async function addVideoAction(formData: FormData) {
  try {
    // Gérer correctement la date
    const dateStr = formData.get("date")?.toString();
    let dateValue: Date | undefined;

    if (dateStr) {
      // Convertir YYYY-MM-DD en objet Date complet
      dateValue = new Date(dateStr);
      // S'assurer qu'il s'agit d'une date valide
      if (isNaN(dateValue.getTime())) {
        dateValue = undefined;
      }
    }

    // Gérer le tag de la section vidéos (conversion titre -> ID)
    let tagSectionVideosId: number | null = null;
    const tagSectionVideosTitle = formData.get("tagSectionVideos")?.toString();
    if (tagSectionVideosTitle) {
      const foundTag = await prisma.videos_tags.findFirst({
        where: { titre: tagSectionVideosTitle },
      });
      if (foundTag) {
        tagSectionVideosId = foundTag.id_tags;
      }
    }

    // Extraire l'ID YouTube du lien ou de l'ID fourni
    const urlOrId = formData.get("url")?.toString() || "";
    const youtubeId = extractYouTubeId(urlOrId);

    const video = await prisma.videos.create({
      data: {
        titre: formData.get("title")?.toString() || "",
        lien: youtubeId,
        date: dateValue || new Date(),
        afficher_carrousel_main: formData.get("afficherCarrouselMain") === "on",
        afficher_section_videos: formData.get("afficherSectionVideos") === "on",
        tag_section_videos: tagSectionVideosId,
        afficher: formData.get("isPublished") === "on",
        derniere_modification: new Date(),
      },
    });

    // 2. Récupérer les tags sélectionnés
    const selectedTags = formData.getAll("tags") as string[];

    // 3. Pour chaque tag sélectionné
    for (const tagId of selectedTags) {
      try {
        // 3.1 D'abord, essayer de trouver le tag
        let tag;
        try {
          // Essayer de trouver le tag par son ID
          tag = await prisma.videos_tags.findFirst({
            where: {
              titre: tagId, // Rechercher par le titre au lieu de l'ID
            },
          });
        } catch (error) {
          console.log("Tag non trouvé, nous allons le créer, error:", error);
        }

        // Si le tag n'existe pas, le créer
        if (!tag) {
          tag = await prisma.videos_tags.create({
            data: {
              titre: tagId, // Utiliser le tagId comme titre
              important: false, // Par défaut, les tags créés automatiquement ne sont pas importants
            },
          });
          console.log("Tag créé avec succès:", tag);
        }

        // 3.2 Créer le lien entre la vidéo et le tag
        await prisma.videos_tags_link.create({
          data: {
            id_vid: video.id_vid, // ID de la vidéo qu'on vient de créer
            id_tags: tag.id_tags, // ID du tag
          },
        });
      } catch (tagError) {
        console.error("Erreur lors du traitement du tag:", tagId, tagError);
      }
    }

    revalidatePath("/videos");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la vidéo:", error);
    throw error; // Retransmettre l'erreur pour la gérer dans l'interface utilisateur
  }
}

export async function updateVideoAction(formData: FormData) {
  try {
    const videoId = parseInt(formData.get("id")?.toString() || "");

    if (isNaN(videoId)) {
      throw new Error("ID de vidéo invalide");
    }

    // Gérer correctement la date
    const dateStr = formData.get("date")?.toString();
    let dateValue: Date | undefined;

    if (dateStr) {
      // Convertir YYYY-MM-DD en objet Date complet
      dateValue = new Date(dateStr);
      // S'assurer qu'il s'agit d'une date valide
      if (isNaN(dateValue.getTime())) {
        dateValue = undefined;
      }
    }

    // Gérer le tag de la section vidéos (conversion titre -> ID)
    let tagSectionVideosId: number | null = null;
    const tagSectionVideosTitle = formData.get("tagSectionVideos")?.toString();
    if (tagSectionVideosTitle) {
      const foundTag = await prisma.videos_tags.findFirst({
        where: { titre: tagSectionVideosTitle },
      });
      if (foundTag) {
        tagSectionVideosId = foundTag.id_tags;
      }
    }

    // Extraire l'ID YouTube du lien ou de l'ID fourni
    const urlOrId = formData.get("url")?.toString() || "";
    const youtubeId = extractYouTubeId(urlOrId);

    // 1. Mettre à jour la vidéo
    const video = await prisma.videos.update({
      where: {
        id_vid: videoId,
      },
      data: {
        titre: formData.get("title")?.toString() || "",
        lien: youtubeId,
        date: dateValue || new Date(),
        afficher_carrousel_main: formData.get("afficherCarrouselMain") === "on",
        afficher_section_videos: formData.get("afficherSectionVideos") === "on",
        tag_section_videos: tagSectionVideosId,
        afficher: formData.get("isPublished") === "on",
        derniere_modification: new Date(),
      },
    });

    // 2. Gérer les tags
    // 2.1. Supprimer tous les liens existants
    await prisma.videos_tags_link.deleteMany({
      where: {
        id_vid: videoId,
      },
    });

    // 2.2. Récupérer les nouveaux tags sélectionnés
    const selectedTags = formData.getAll("tags") as string[];

    // 2.3. Créer de nouveaux liens pour chaque tag sélectionné
    for (const tagId of selectedTags) {
      // Vérifier si le tag existe
      let tag = await prisma.videos_tags.findFirst({
        where: {
          titre: tagId,
        },
      });

      // Créer le tag s'il n'existe pas
      if (!tag) {
        tag = await prisma.videos_tags.create({
          data: {
            titre: tagId,
            important: false, // Par défaut, les tags créés automatiquement ne sont pas importants
          },
        });
      }

      // Créer le lien entre la vidéo et le tag
      await prisma.videos_tags_link.create({
        data: {
          id_vid: videoId,
          id_tags: tag.id_tags,
        },
      });
    }

    revalidatePath("/videos");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la vidéo:", error);
    throw error;
  }
}

export async function deleteVideoAction(videoId: number) {
  try {
    // Vérifier si l'ID est valide
    if (isNaN(videoId)) {
      throw new Error("ID de vidéo invalide");
    }

    // 1. Supprimer d'abord tous les liens vers les tags
    await prisma.videos_tags_link.deleteMany({
      where: {
        id_vid: videoId,
      },
    });

    // 2. Supprimer la vidéo elle-même
    await prisma.videos.delete({
      where: {
        id_vid: videoId,
      },
    });

    // 3. Revalider le chemin pour mettre à jour la liste des vidéos
    revalidatePath("/videos");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la vidéo:", error);
    throw error;
  }
}

// Action pour supprimer un tag
export async function deleteVideoTagAction(id: number) {
  try {
    // 1. Supprimer tous les liens entre ce tag et des vidéos
    await prisma.videos_tags_link.deleteMany({
      where: { id_tags: id },
    });

    // 2. Supprimer le tag lui-même
    await prisma.videos_tags.delete({
      where: { id_tags: id },
    });

    revalidatePath("/videos/tags");
    revalidatePath("/videos");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du tag:", error);
    throw error;
  }
}

export async function updateVideoTagAction(
  id: number,
  title: string,
  important?: boolean
) {
  try {
    // Créer un objet de données à mettre à jour
    const updateData: {
      titre: string;
      important?: boolean;
    } = {
      titre: title,
    };

    // Ajouter important à l'objet uniquement s'il est défini
    if (important !== undefined) {
      updateData.important = important;
    }

    // Mettre à jour le tag
    await prisma.videos_tags.update({
      where: { id_tags: id },
      data: updateData,
    });

    revalidatePath("/videos/tags");
    revalidatePath("/videos");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tag:", error);
    throw error;
  }
}

// Action pour créer un nouveau tag
export async function createVideoTagAction(
  title: string,
  important: boolean = false
) {
  try {
    // Vérifier si le tag existe déjà (pour éviter les doublons)
    const existingTag = await prisma.videos_tags.findFirst({
      where: { titre: title },
    });

    if (existingTag) {
      return {
        success: false,
        error: "Ce tag existe déjà",
        tag: existingTag,
      };
    }

    // Créer le nouveau tag avec le paramètre important
    const newTag = await prisma.videos_tags.create({
      data: {
        titre: title,
        important: important,
      },
    });

    revalidatePath("/videos/tags");
    revalidatePath("/videos");

    return {
      success: true,
      tag: newTag,
    };
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
    throw error;
  }
}

// Basculer l'état d'une vidéo dans les sections épinglées
export async function toggleVideoFeaturedAction(
  videoId: number,
  section: "main" | "videos"
) {
  try {
    const video = await prisma.videos.findUnique({
      where: { id_vid: videoId },
      select: {
        afficher_carrousel_main: true,
        afficher_section_videos: true,
      },
    });

    if (!video) {
      throw new Error("Vidéo introuvable");
    }

    const updateData: {
      afficher_carrousel_main?: boolean;
      afficher_section_videos?: boolean;
    } = {};

    if (section === "main") {
      updateData.afficher_carrousel_main = !video.afficher_carrousel_main;
    } else if (section === "videos") {
      updateData.afficher_section_videos = !video.afficher_section_videos;
    }

    await prisma.videos.update({
      where: { id_vid: videoId },
      data: updateData,
    });

    revalidatePath("/videos");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la vidéo:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour",
    };
  }
}

// Mettre à jour le tag mis en avant pour une vidéo dans la section vidéos
export async function updateVideoFeaturedTagAction(
  videoId: number,
  tagId: number | null
) {
  try {
    await prisma.videos.update({
      where: { id_vid: videoId },
      data: {
        tag_section_videos: tagId,
      },
    });

    revalidatePath("/videos");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tag:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour",
    };
  }
}
