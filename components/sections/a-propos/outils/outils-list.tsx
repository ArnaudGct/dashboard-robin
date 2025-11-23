"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { OutilItem } from "./outil-item";
import { reorderOutilsAction } from "@/actions/apropos_outils-actions";
import { toast } from "sonner";

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

interface OutilsListProps {
  initialOutils: Outil[];
}

export function OutilsList({ initialOutils }: OutilsListProps) {
  const [outils, setOutils] = useState(initialOutils);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newOutils = [...outils];
    [newOutils[index], newOutils[index - 1]] = [
      newOutils[index - 1],
      newOutils[index],
    ];

    // Mettre à jour les ordres
    const updatedOutils = newOutils.map((outil, idx) => ({
      ...outil,
      ordre: idx,
    }));

    setOutils(updatedOutils);

    // Sauvegarder en base de données
    const result = await reorderOutilsAction(
      updatedOutils.map((o) => ({ id_outil: o.id_outil, ordre: o.ordre }))
    );

    if (result.success) {
      toast.success("Ordre mis à jour");
    } else {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setOutils(initialOutils);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === outils.length - 1) return;

    const newOutils = [...outils];
    [newOutils[index], newOutils[index + 1]] = [
      newOutils[index + 1],
      newOutils[index],
    ];

    // Mettre à jour les ordres
    const updatedOutils = newOutils.map((outil, idx) => ({
      ...outil,
      ordre: idx,
    }));

    setOutils(updatedOutils);

    // Sauvegarder en base de données
    const result = await reorderOutilsAction(
      updatedOutils.map((o) => ({ id_outil: o.id_outil, ordre: o.ordre }))
    );

    if (result.success) {
      toast.success("Ordre mis à jour");
    } else {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setOutils(initialOutils);
    }
  };

  if (outils.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Aucun outil trouvé</p>
      </Card>
    );
  }

  // Séparer les outils par type
  const outilsDetailles = outils.filter((o) => o.type_outil === "detaille");
  const outilsSimples = outils.filter((o) => o.type_outil === "simple");

  return (
    <div className="flex flex-col gap-8">
      {/* Outils détaillés */}
      {outilsDetailles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Outils détaillés</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {outilsDetailles.map((outil, idx) => {
              const globalIndex = outils.findIndex(
                (o) => o.id_outil === outil.id_outil
              );
              return (
                <OutilItem
                  key={outil.id_outil}
                  outil={outil}
                  isFirst={globalIndex === 0}
                  isLast={globalIndex === outils.length - 1}
                  onMoveUp={() => handleMoveUp(globalIndex)}
                  onMoveDown={() => handleMoveDown(globalIndex)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Outils simples */}
      {outilsSimples.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Outils simples</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {outilsSimples.map((outil, idx) => {
              const globalIndex = outils.findIndex(
                (o) => o.id_outil === outil.id_outil
              );
              return (
                <OutilItem
                  key={outil.id_outil}
                  outil={outil}
                  isFirst={globalIndex === 0}
                  isLast={globalIndex === outils.length - 1}
                  onMoveUp={() => handleMoveUp(globalIndex)}
                  onMoveDown={() => handleMoveDown(globalIndex)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
