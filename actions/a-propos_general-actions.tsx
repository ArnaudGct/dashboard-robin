"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "@/lib/cloudinary";

export async function updateAProposGeneral(formData: FormData) {
  const photoFile = formData.get("photo") as File;
  const photoAlt = formData.get("photo_alt") as string;
  const creditNom = formData.get("credit_nom") as string;
  const creditUrl = formData.get("credit_url") as string;
  const description = formData.get("description") as string;

  try {
    console.log("=== DÉBUT MISE À JOUR À PROPOS GÉNÉRAL ===");

    // Validation du texte alternatif
    if (!photoAlt || !photoAlt.trim()) {
      return {
        success: false,
        message: "Le texte alternatif de la photo est obligatoire",
      };
    }

    // Vérifier s'il y a déjà un enregistrement
    const existingRecord = await prisma.apropos_general.findFirst();

    let photoUrl = existingRecord?.photo || "";
    let oldPublicId: string | null = null;

    // Si une nouvelle photo est uploadée
    if (photoFile && photoFile.size > 0) {
      console.log("Upload nouvelle photo à propos général...");
      console.log(`Taille du fichier: ${photoFile.size} bytes`);

      // Extraire l'ancien publicId pour suppression ultérieure
      if (existingRecord?.photo) {
        oldPublicId = extractPublicIdFromUrl(existingRecord.photo);
        console.log(`Ancien publicId extrait: ${oldPublicId}`);
      }

      // Upload de la photo sans compression
      const result = await uploadToCloudinary(
        photoFile,
        undefined,
        "portfolio/apropos/general"
      );

      photoUrl = result.url;
      console.log("Photo à propos uploadée:", photoUrl);

      // Supprimer l'ancienne photo de Cloudinary si elle existe
      if (oldPublicId) {
        console.log(`Suppression de l'ancienne photo à propos: ${oldPublicId}`);
        try {
          await deleteFromCloudinary(oldPublicId);
          console.log("✓ Ancienne photo supprimée avec succès");
        } catch (deleteError) {
          console.warn(
            "⚠️ Erreur lors de la suppression de l'ancienne photo:",
            deleteError
          );
        }
      }
    }

    if (existingRecord) {
      // Mettre à jour l'enregistrement existant
      await prisma.apropos_general.update({
        where: { id_gen: existingRecord.id_gen },
        data: {
          photo: photoUrl,
          photo_alt: photoAlt.trim(),
          description: description,
        },
      });
      console.log("✓ Enregistrement mis à jour en base de données");
    } else {
      // Créer un nouvel enregistrement
      await prisma.apropos_general.create({
        data: {
          photo: photoUrl,
          photo_alt: photoAlt.trim(),
          description: description,
        },
      });
      console.log("✓ Nouvel enregistrement créé en base de données");
    }

    revalidatePath("/a-propos/general");
    console.log("=== FIN MISE À JOUR À PROPOS GÉNÉRAL ===");
    return { success: true, message: "Données mises à jour avec succès" };
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour",
    };
  }
}

export async function getAProposGeneral() {
  try {
    const data = await prisma.apropos_general.findFirst();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return null;
  }
}
