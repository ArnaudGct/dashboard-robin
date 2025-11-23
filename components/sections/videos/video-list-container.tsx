"use client";

import { VideoItem } from "./video-item";
import { VideoFeaturedSections } from "./video-featured-sections";
import {
  toggleVideoFeaturedAction,
  updateVideoFeaturedTagAction,
} from "@/actions/videos-actions";
import { toast } from "sonner";
import { Video as VideoType } from "@/types/video";

type VideoTag = {
  id_tags: number;
  titre: string;
};

type VideoWithFeatured = VideoType["video"] & {
  afficher_carrousel_main: boolean;
  afficher_section_videos: boolean;
  tag_section_videos: number | null;
};

type VideoListContainerProps = {
  videos: VideoWithFeatured[];
  allTags: VideoTag[];
};

export function VideoListContainer({
  videos,
  allTags,
}: VideoListContainerProps) {
  // Fonction pour gérer le basculement des vidéos épinglées
  const handleToggleFeatured = async (
    videoId: number,
    section: "main" | "videos"
  ) => {
    const result = await toggleVideoFeaturedAction(videoId, section);
    if (result.success) {
      toast.success(
        section === "main"
          ? "Vidéo mise à jour pour le carrousel principal"
          : "Vidéo mise à jour pour la section vidéos"
      );
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  // Fonction pour gérer la mise à jour du tag mis en avant
  const handleUpdateFeaturedTag = async (
    videoId: number,
    tagId: number | null
  ) => {
    const result = await updateVideoFeaturedTagAction(videoId, tagId);
    if (result.success) {
      toast.success(
        tagId ? "Tag mis en avant mis à jour" : "Tag mis en avant supprimé"
      );
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Sections épinglées */}
      <VideoFeaturedSections
        videos={videos}
        allTags={allTags}
        onToggleFeatured={handleToggleFeatured}
        onUpdateFeaturedTag={handleUpdateFeaturedTag}
      />

      {/* Liste des vidéos */}
      <div className="flex flex-col gap-6">
        {videos.map((video) => (
          <VideoItem key={video.id_vid} video={video} />
        ))}
      </div>
    </div>
  );
}
