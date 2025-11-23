"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2, Tag as TagIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { extractYoutubeId } from "@/lib/utils";
import { LiteYoutubeEmbed } from "react-lite-yt-embed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "@/components/tag";

const MAX_MAIN_CAROUSEL = 6;
const MAX_VIDEOS_CAROUSEL = 6;

type VideoTag = {
  id_tags: number;
  titre: string;
};

type Video = {
  id_vid: number;
  titre: string;
  lien: string;
  afficher_carrousel_main: boolean;
  afficher_section_videos: boolean;
  tag_section_videos: number | null;
};

type VideoFeaturedSectionsProps = {
  videos: Video[];
  allTags: VideoTag[];
  onToggleFeatured: (
    videoId: number,
    section: "main" | "videos"
  ) => Promise<void>;
  onUpdateFeaturedTag: (videoId: number, tagId: number | null) => Promise<void>;
};

export function VideoFeaturedSections({
  videos,
  allTags,
  onToggleFeatured,
  onUpdateFeaturedTag,
}: VideoFeaturedSectionsProps) {
  const [isAddingMain, setIsAddingMain] = useState(false);
  const [isAddingVideos, setIsAddingVideos] = useState(false);
  const [loadingVideoId, setLoadingVideoId] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mainCarouselVideos = videos.filter((v) => v.afficher_carrousel_main);
  const videosCarouselVideos = videos.filter((v) => v.afficher_section_videos);
  const availableForMain = videos.filter((v) => !v.afficher_carrousel_main);
  const availableForVideos = videos.filter((v) => !v.afficher_section_videos);

  const handleToggle = async (videoId: number, section: "main" | "videos") => {
    setLoadingVideoId(videoId);
    try {
      await onToggleFeatured(videoId, section);
    } finally {
      setLoadingVideoId(null);
      if (section === "main") setIsAddingMain(false);
      if (section === "videos") setIsAddingVideos(false);
    }
  };

  const renderVideoThumbnail = (video: Video) => {
    const youtubeId = extractYoutubeId(video.lien);

    if (!isClient || !youtubeId) {
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Loader2 size={16} className="animate-spin" />
        </div>
      );
    }

    return (
      <div className="w-full h-full pointer-events-none">
        <LiteYoutubeEmbed id={youtubeId} />
      </div>
    );
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
              {mainCarouselVideos.length} / {MAX_MAIN_CAROUSEL} vidéo
              {mainCarouselVideos.length !== 1 ? "s" : ""} épinglée
              {mainCarouselVideos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingMain(!isAddingMain)}
            className="cursor-pointer"
            disabled={mainCarouselVideos.length >= MAX_MAIN_CAROUSEL}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {isAddingMain && availableForMain.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">
              Sélectionner une vidéo à ajouter :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {availableForMain.map((video) => (
                <button
                  key={video.id_vid}
                  onClick={() => handleToggle(video.id_vid, "main")}
                  disabled={loadingVideoId === video.id_vid}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer",
                    loadingVideoId === video.id_vid && "opacity-50"
                  )}
                >
                  {renderVideoThumbnail(video)}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">
                      {video.titre}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {mainCarouselVideos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucune vidéo épinglée dans cette section
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mainCarouselVideos.map((video) => (
              <div key={video.id_vid} className="relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {renderVideoThumbnail(video)}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {video.titre}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleToggle(video.id_vid, "main")}
                  disabled={loadingVideoId === video.id_vid}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section Page Vidéos */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Section vidéos (Accueil)
              </h3>
              <p className="text-sm text-muted-foreground">
                {videosCarouselVideos.length} / {MAX_VIDEOS_CAROUSEL} vidéo
                {videosCarouselVideos.length !== 1 ? "s" : ""} épinglée
                {videosCarouselVideos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingVideos(!isAddingVideos)}
              className="cursor-pointer"
              disabled={videosCarouselVideos.length >= MAX_VIDEOS_CAROUSEL}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {/* Gestion du tag mis en avant */}
          {videosCarouselVideos.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Tag mis en avant :</p>
              </div>
              <div className="flex flex-col gap-3">
                {videosCarouselVideos.map((video) => {
                  const featuredTag = video.tag_section_videos
                    ? allTags.find(
                        (t) => t.id_tags === video.tag_section_videos
                      )
                    : null;

                  return (
                    <div
                      key={`tag-${video.id_vid}`}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <p className="text-sm flex-shrink-0 min-w-[120px] truncate">
                        {video.titre}
                      </p>
                      <div className="flex items-center gap-2 flex-1">
                        <Select
                          value={video.tag_section_videos?.toString() || "none"}
                          onValueChange={(value) => {
                            const tagId =
                              value === "none" ? null : parseInt(value);
                            onUpdateFeaturedTag(video.id_vid, tagId);
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Aucun tag" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun tag</SelectItem>
                            {allTags.map((tag) => (
                              <SelectItem
                                key={tag.id_tags}
                                value={tag.id_tags.toString()}
                              >
                                {tag.titre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {featuredTag && (
                          <Tag variant="default">{featuredTag.titre}</Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isAddingVideos && availableForVideos.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">
              Sélectionner une vidéo à ajouter :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {availableForVideos.map((video) => (
                <button
                  key={video.id_vid}
                  onClick={() => handleToggle(video.id_vid, "videos")}
                  disabled={loadingVideoId === video.id_vid}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer",
                    loadingVideoId === video.id_vid && "opacity-50"
                  )}
                >
                  {renderVideoThumbnail(video)}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">
                      {video.titre}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {videosCarouselVideos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucune vidéo épinglée dans cette section
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videosCarouselVideos.map((video) => (
              <div key={video.id_vid} className="relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {renderVideoThumbnail(video)}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {video.titre}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleToggle(video.id_vid, "videos")}
                  disabled={loadingVideoId === video.id_vid}
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
