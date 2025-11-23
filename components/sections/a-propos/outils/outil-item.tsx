"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteOutilAction,
  toggleOutilVisibilityAction,
  updateOutilOrdreAction,
} from "@/actions/apropos_outils-actions";

type Outil = {
  id_outil: number;
  type_outil: string;
  titre: string;
  description: string;
  icone: string;
  icone_alt: string;
  icone_rounded: boolean;
  lien: string;
  couleur_fond: string;
  couleur_titre: string;
  couleur_description: string;
  ordre: number;
  afficher: boolean;
};

interface OutilItemProps {
  outil: Outil;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function OutilItem({
  outil,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: OutilItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMoveUp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveUp) onMoveUp();
  };

  const handleMoveDown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveDown) onMoveDown();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteOutilAction(outil.id_outil);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const result = await toggleOutilVisibilityAction(
        outil.id_outil,
        !outil.afficher
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors du changement de visibilité:", error);
      toast.error("Erreur lors du changement de visibilité");
    }
  };

  const handleCardClick = () => {
    router.push(`/a-propos/outils/edit/${outil.id_outil}`);
  };

  return (
    <Card
      className="w-full cursor-pointer hover:shadow-md transition-all"
      onClick={handleCardClick}
      style={{
        backgroundColor:
          outil.type_outil === "simple" ? outil.couleur_fond : "transparent",
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {outil.icone && (
              <div className="flex-shrink-0">
                <Image
                  src={outil.icone}
                  alt={outil.icone_alt || outil.titre}
                  width={32}
                  height={32}
                  className={outil.icone_rounded ? "rounded-full" : "rounded"}
                />
              </div>
            )}
            <span style={{ color: outil.couleur_titre }}>{outil.titre}</span>
          </div>
          <div className="flex gap-2 items-center">
            <Badge
              variant={
                outil.type_outil === "detaille" ? "default" : "secondary"
              }
            >
              {outil.type_outil === "detaille" ? "Détaillé" : "Simple"}
            </Badge>
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoveUp}
                disabled={isFirst}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoveDown}
                disabled={isLast}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1 items-center text-muted-foreground">
              {outil.afficher ? <Eye size={18} /> : <EyeOff size={18} />}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      {outil.type_outil === "detaille" && outil.description && (
        <CardContent>
          <div
            className="leading-7 max-w-none"
            style={{ color: outil.couleur_description }}
          >
            <p>{outil.description}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
