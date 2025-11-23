"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
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
};

export function ClientItem({ client }: ClientItemProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/accueil/clients/edit/${client.id_client}`);
  };

  return (
    <Card
      className="w-full cursor-pointer hover:shadow-md transition-all"
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{client.client}</span>
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
