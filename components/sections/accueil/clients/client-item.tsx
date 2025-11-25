"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

type ClientItemProps = {
  client: {
    id_client: number;
    client: string;
    logo: string;
    alt_logo: string;
    afficher: boolean;
  };
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function ClientItem({
  client,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: ClientItemProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/accueil/clients/edit/${client.id_client}`);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveUp) onMoveUp();
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveDown) onMoveDown();
  };

  return (
    <Card
      className="w-full cursor-pointer hover:shadow-md transition-all"
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{client.client}</span>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 items-center text-muted-foreground">
              {client.afficher ? (
                <>
                  <Eye size={18} />
                  <span className="text-sm">Visible</span>
                </>
              ) : (
                <>
                  <EyeOff size={18} />
                  <span className="text-sm">Non visible</span>
                </>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMoveUp}
                disabled={isFirst}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMoveDown}
                disabled={isLast}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {client.logo && (
          <div className="flex justify-center mb-4">
            <Image
              src={client.logo}
              alt={client.alt_logo || `Logo de ${client.client}`}
              width={80}
              height={80}
              className="h-20 w-auto object-contain"
            />
          </div>
        )}
        {/* <div className="leading-7 text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{client.contenu}</ReactMarkdown>
        </div> */}
      </CardContent>
    </Card>
  );
}
