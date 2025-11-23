"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// Récupérer une expérience par son ID
export async function getExperienceByIdAction(id: number) {
  try {
    const experience = await prisma.apropos_experiences.findUnique({
      where: {
        id_exp: id,
      },
    });

    return experience;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'expérience:", error);
    throw error;
  }
}

// Ajouter une expérience
export async function addExperienceAction(formData: FormData) {
  try {
    const dateDebutStr = formData.get("date_debut")?.toString();
    const dateFinStr = formData.get("date_fin")?.toString();

    let dateDebut: Date | undefined;
    let dateFin: Date | undefined;

    if (dateDebutStr) {
      dateDebut = new Date(dateDebutStr);
      if (isNaN(dateDebut.getTime())) {
        dateDebut = undefined;
      }
    }

    if (dateFinStr && dateFinStr !== "en_cours") {
      dateFin = new Date(dateFinStr);
      if (isNaN(dateFin.getTime())) {
        dateFin = undefined;
      }
    }

    // Créer l'expérience
    const experience = await prisma.apropos_experiences.create({
      data: {
        titre: formData.get("titre")?.toString() || "",
        nom_entreprise: formData.get("nom_entreprise")?.toString() || "",
        lien_entreprise: formData.get("lien_entreprise")?.toString() || "",
        date_debut: dateDebut || new Date(),
        date_fin: dateFin || null,
        afficher: formData.get("afficher") === "on",
      },
    });

    revalidatePath("/a-propos/experiences");
    return { success: true, id: experience.id_exp };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'expérience:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Mettre à jour une expérience
export async function updateExperienceAction(formData: FormData) {
  try {
    const id = parseInt(formData.get("id")?.toString() || "0");

    if (!id) {
      throw new Error("ID manquant");
    }

    // Récupérer l'expérience existante
    const existingExperience = await prisma.apropos_experiences.findUnique({
      where: { id_exp: id },
    });

    if (!existingExperience) {
      throw new Error("Expérience non trouvée");
    }

    const dateDebutStr = formData.get("date_debut")?.toString();
    const dateFinStr = formData.get("date_fin")?.toString();

    let dateDebut: Date | undefined;
    let dateFin: Date | undefined | null = null;

    if (dateDebutStr) {
      dateDebut = new Date(dateDebutStr);
      if (isNaN(dateDebut.getTime())) {
        dateDebut = undefined;
      }
    }

    if (dateFinStr && dateFinStr !== "en_cours") {
      dateFin = new Date(dateFinStr);
      if (isNaN(dateFin.getTime())) {
        dateFin = null;
      }
    }

    // Mettre à jour l'expérience
    await prisma.apropos_experiences.update({
      where: { id_exp: id },
      data: {
        titre: formData.get("titre")?.toString() || "",
        nom_entreprise: formData.get("nom_entreprise")?.toString() || "",
        lien_entreprise: formData.get("lien_entreprise")?.toString() || "",
        date_debut: dateDebut,
        date_fin: dateFin === undefined ? null : dateFin,
        afficher: formData.get("afficher") === "on",
      },
    });

    revalidatePath("/a-propos/experiences");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'expérience:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Supprimer une expérience
export async function deleteExperienceAction(id: number) {
  try {
    // Récupérer l'expérience
    const experience = await prisma.apropos_experiences.findUnique({
      where: { id_exp: id },
    });

    if (!experience) {
      throw new Error("Expérience non trouvée");
    }

    // Supprimer l'expérience de la base de données
    await prisma.apropos_experiences.delete({
      where: { id_exp: id },
    });

    revalidatePath("/a-propos/experiences");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'expérience:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}
