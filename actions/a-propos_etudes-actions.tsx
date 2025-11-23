"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// Récupérer une étude par son ID
export async function getEtudeByIdAction(id: number) {
  try {
    const etude = await prisma.apropos_etudes.findUnique({
      where: {
        id_etu: id,
      },
    });

    return etude;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étude:", error);
    throw error;
  }
}

// Ajouter une étude
export async function addEtudeAction(formData: FormData) {
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

    // Créer l'étude
    const etude = await prisma.apropos_etudes.create({
      data: {
        titre: formData.get("titre")?.toString() || "",
        nom_ecole: formData.get("nom_ecole")?.toString() || "",
        lien_ecole: formData.get("lien_ecole")?.toString() || "",
        date_debut: dateDebut || new Date(),
        date_fin: dateFin || null,
        afficher: formData.get("afficher") === "on",
      },
    });

    revalidatePath("/a-propos/etudes");
    return { success: true, id: etude.id_etu };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'étude:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Mettre à jour une étude
export async function updateEtudeAction(formData: FormData) {
  try {
    const id = parseInt(formData.get("id")?.toString() || "0");

    if (!id) {
      throw new Error("ID manquant");
    }

    // Récupérer l'étude existante
    const existingEtude = await prisma.apropos_etudes.findUnique({
      where: { id_etu: id },
    });

    if (!existingEtude) {
      throw new Error("Étude non trouvée");
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

    // Mettre à jour l'étude
    await prisma.apropos_etudes.update({
      where: { id_etu: id },
      data: {
        titre: formData.get("titre")?.toString() || "",
        nom_ecole: formData.get("nom_ecole")?.toString() || "",
        lien_ecole: formData.get("lien_ecole")?.toString() || "",
        date_debut: dateDebut,
        date_fin: dateFin === undefined ? null : dateFin,
        afficher: formData.get("afficher") === "on",
      },
    });

    revalidatePath("/a-propos/etudes");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étude:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}

// Supprimer une étude
export async function deleteEtudeAction(id: number) {
  try {
    // Récupérer l'étude
    const etude = await prisma.apropos_etudes.findUnique({
      where: { id_etu: id },
    });

    if (!etude) {
      throw new Error("Étude non trouvée");
    }

    // Supprimer l'étude de la base de données
    await prisma.apropos_etudes.delete({
      where: { id_etu: id },
    });

    revalidatePath("/a-propos/etudes");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étude:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";
    return { success: false, error: errorMessage };
  }
}
