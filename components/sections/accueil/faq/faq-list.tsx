"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FaqItem } from "./faq-item";
import { reorderFaqsAction } from "@/actions/accueil_faq-actions";
import { toast } from "sonner";

type Faq = {
  id_faq: number;
  titre: string;
  contenu: string;
  ordre: number;
  afficher: boolean;
};

interface FaqListProps {
  initialFaqs: Faq[];
}

export function FaqList({ initialFaqs }: FaqListProps) {
  const [faqs, setFaqs] = useState(initialFaqs);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];

    // Mettre à jour les ordres
    const updatedFaqs = newFaqs.map((faq, idx) => ({
      ...faq,
      ordre: idx,
    }));

    setFaqs(updatedFaqs);

    // Sauvegarder en base de données
    const result = await reorderFaqsAction(
      updatedFaqs.map((f) => ({ id_faq: f.id_faq, ordre: f.ordre }))
    );

    if (result.success) {
      toast.success("Ordre mis à jour");
    } else {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setFaqs(initialFaqs);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqs.length - 1) return;

    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];

    // Mettre à jour les ordres
    const updatedFaqs = newFaqs.map((faq, idx) => ({
      ...faq,
      ordre: idx,
    }));

    setFaqs(updatedFaqs);

    // Sauvegarder en base de données
    const result = await reorderFaqsAction(
      updatedFaqs.map((f) => ({ id_faq: f.id_faq, ordre: f.ordre }))
    );

    if (result.success) {
      toast.success("Ordre mis à jour");
    } else {
      toast.error(result.message);
      // Remettre l'ordre précédent en cas d'erreur
      setFaqs(initialFaqs);
    }
  };

  if (faqs.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Aucune question fréquemment posée trouvée
        </p>
      </Card>
    );
  }

  // Séparer les FAQ visibles et non visibles
  const visibleFaqs = faqs.filter((faq) => faq.afficher);
  const hiddenFaqs = faqs.filter((faq) => !faq.afficher);

  return (
    <div className="flex flex-col gap-8">
      {/* FAQ visibles */}
      {visibleFaqs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {visibleFaqs.map((faq) => {
            const globalIndex = faqs.findIndex((f) => f.id_faq === faq.id_faq);
            return (
              <FaqItem
                key={faq.id_faq}
                faq={faq}
                isFirst={globalIndex === 0}
                isLast={globalIndex === faqs.length - 1}
                onMoveUp={() => handleMoveUp(globalIndex)}
                onMoveDown={() => handleMoveDown(globalIndex)}
              />
            );
          })}
        </div>
      )}

      {/* FAQ non visibles */}
      {hiddenFaqs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Questions non visibles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {hiddenFaqs.map((faq) => {
              const globalIndex = faqs.findIndex(
                (f) => f.id_faq === faq.id_faq
              );
              return (
                <div key={faq.id_faq} className="opacity-60">
                  <FaqItem
                    faq={faq}
                    isFirst={globalIndex === 0}
                    isLast={globalIndex === faqs.length - 1}
                    onMoveUp={() => handleMoveUp(globalIndex)}
                    onMoveDown={() => handleMoveDown(globalIndex)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
