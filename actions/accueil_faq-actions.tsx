"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// Récupérer une FAQ par son ID
export async function getFaqByIdAction(id: number) {
  try {
    const faq = await prisma.accueil_faq.findUnique({
      where: { id_faq: id },
    });
    return faq;
  } catch (error) {
    console.error("Erreur lors de la récupération de la FAQ:", error);
    throw error;
  }
}

// Mettre à jour une FAQ
export async function updateFaqAction(formData: FormData) {
  try {
    const id = parseInt(formData.get("id")?.toString() || "0");
    if (!id) {
      throw new Error("ID manquant");
    }

    const titre = formData.get("titre")?.toString();
    const contenu = formData.get("contenu")?.toString();
    const afficher = formData.get("afficher") === "on";

    if (!titre || !contenu) {
      return { success: false, error: "Le titre et le contenu sont requis." };
    }

    await prisma.accueil_faq.update({
      where: { id_faq: id },
      data: {
        titre,
        contenu,
        afficher,
      },
    });

    revalidatePath("/accueil/faq");
    revalidatePath(`/accueil/faq/edit/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la FAQ:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Ajouter une FAQ
export async function addFaqAction(formData: FormData) {
  try {
    const titre = formData.get("titre")?.toString();
    const contenu = formData.get("contenu")?.toString();
    const afficher = formData.get("afficher") === "on";

    if (!titre || !contenu) {
      return { success: false, error: "Le titre et le contenu sont requis." };
    }

    // Récupérer le nombre de FAQ existantes pour définir l'ordre
    const faqCount = await prisma.accueil_faq.count();
    const ordre = faqCount;

    await prisma.accueil_faq.create({
      data: {
        titre,
        contenu,
        ordre,
        afficher,
      },
    });

    revalidatePath("/accueil/faq");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la FAQ:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Supprimer une FAQ
export async function deleteFaqAction(id: number) {
  try {
    if (!id) {
      throw new Error("ID manquant");
    }

    await prisma.accueil_faq.delete({
      where: { id_faq: id },
    });

    revalidatePath("/accueil/faq");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la FAQ:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Réorganiser les FAQ
export async function reorderFaqsAction(
  faqs: { id_faq: number; ordre: number }[]
) {
  try {
    // Mettre à jour l'ordre de toutes les FAQ en une transaction
    await prisma.$transaction(
      faqs.map((faq) =>
        prisma.accueil_faq.update({
          where: { id_faq: faq.id_faq },
          data: { ordre: faq.ordre },
        })
      )
    );

    revalidatePath("/accueil/faq");
    return { success: true, message: "Ordre mis à jour avec succès" };
  } catch (error) {
    console.error("❌ Erreur lors de la réorganisation:", error);
    return {
      success: false,
      message: "Erreur lors de la réorganisation",
    };
  }
}
