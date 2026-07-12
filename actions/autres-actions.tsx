"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  uploadAProposImageToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "@/lib/cloudinary";

// Action pour mettre à jour les informations générales (logo + email + localisation)
export async function updateGeneral(formData: FormData) {
  const logoFile = formData.get("logo") as File | null;
  const email = formData.get("email") as string;
  const localisation = formData.get("localisation") as string;

  try {
    console.log("=== DÉBUT MISE À JOUR GÉNÉRAL ===");

    const existingGeneral = await prisma.autres_general.findFirst();

    let logoUrl = existingGeneral?.logo || "";
    let oldLogoPublicId: string | null = null;

    // Si un nouveau logo est uploadé
    if (logoFile instanceof File && logoFile.size > 0) {
      console.log("Upload nouveau logo...");

      if (existingGeneral?.logo) {
        oldLogoPublicId = extractPublicIdFromUrl(existingGeneral.logo);
      }

      const isSvg = logoFile.type === "image/svg+xml" || logoFile.name.toLowerCase().endsWith(".svg");

      const result = await uploadAProposImageToCloudinary(
        logoFile,
        "portfolio/general",
        {
          width: 300,
          height: 300,
          crop: "fit",
          quality: "auto:good",
          format: isSvg ? "svg" : "png",
        },
      );

      logoUrl = result.url;
      console.log("Logo uploadé:", logoUrl);

      // Supprimer l'ancien logo
      if (oldLogoPublicId) {
        try {
          await deleteFromCloudinary(oldLogoPublicId);
          console.log("✓ Ancien logo supprimé avec succès");
        } catch (deleteError) {
          console.warn(
            "⚠️ Erreur lors de la suppression de l'ancien logo:",
            deleteError,
          );
        }
      }
    }

    // Créer ou mettre à jour les informations générales
    if (existingGeneral) {
      await prisma.autres_general.update({
        where: { id_general: existingGeneral.id_general },
        data: {
          logo: logoUrl,
          email: email,
          localisation: localisation,
        },
      });
    } else {
      await prisma.autres_general.create({
        data: {
          logo: logoUrl,
          email: email,
          localisation: localisation,
        },
      });
    }

    revalidatePath("/autres");
    console.log("=== FIN MISE À JOUR GÉNÉRAL ===");

    return {
      success: true,
      message: "Informations générales mises à jour avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des informations générales:",
      error,
    );
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour des informations générales",
    };
  }
}

// Action pour créer un réseau social
export async function createReseauSocial(formData: FormData) {
  const logoFile = formData.get("logo") as File | null;
  const nom = formData.get("nom") as string;
  const lien = formData.get("lien") as string;
  const nomProfil = formData.get("nom_profil") as string;

  try {
    console.log("=== DÉBUT CRÉATION RÉSEAU SOCIAL ===");

    if (!logoFile || logoFile.size === 0) {
      return {
        success: false,
        message: "Le logo est obligatoire",
      };
    }

    const isSvg = logoFile.type === "image/svg+xml" || logoFile.name.toLowerCase().endsWith(".svg");

    // Upload du logo
    const result = await uploadAProposImageToCloudinary(
      logoFile,
      "portfolio/contact",
      {
        width: 100,
        height: 100,
        crop: "fit",
        quality: "auto:good",
        format: isSvg ? "svg" : "png",
      },
    );

    // Trouver le prochain ordre disponible
    const maxOrdreReseau = await prisma.autres_contact.findFirst({
      orderBy: { ordre: "desc" },
      select: { ordre: true },
    });
    const nextOrdre = (maxOrdreReseau?.ordre ?? -1) + 1;

    // Créer le réseau social
    const newReseau = await prisma.autres_contact.create({
      data: {
        logo: result.url,
        nom,
        lien,
        nom_profil: nomProfil,
        ordre: nextOrdre,
      },
    });

    revalidatePath("/autres");
    console.log("=== FIN CRÉATION RÉSEAU SOCIAL ===");

    return {
      success: true,
      message: "Réseau social créé avec succès",
      data: newReseau,
    };
  } catch (error) {
    console.error("Erreur lors de la création du réseau social:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du réseau social",
    };
  }
}

// Action pour mettre à jour un réseau social
export async function updateReseauSocial(formData: FormData) {
  const id = formData.get("id") as string;
  const logoFile = formData.get("logo") as File | null;
  const nom = formData.get("nom") as string;
  const lien = formData.get("lien") as string;
  const nomProfil = formData.get("nom_profil") as string;

  try {
    console.log("=== DÉBUT MISE À JOUR RÉSEAU SOCIAL ===");

    const existingReseau = await prisma.autres_contact.findUnique({
      where: { id_contact: parseInt(id, 10) },
    });

    if (!existingReseau) {
      return {
        success: false,
        message: "Réseau social non trouvé",
      };
    }

    let logoUrl = existingReseau.logo;
    let oldLogoPublicId: string | null = null;

    // Si un nouveau logo est uploadé
    if (logoFile instanceof File && logoFile.size > 0) {
      console.log("Upload nouveau logo du réseau social...");

      if (existingReseau.logo) {
        oldLogoPublicId = extractPublicIdFromUrl(existingReseau.logo);
      }

      const isSvg = logoFile.type === "image/svg+xml" || logoFile.name.toLowerCase().endsWith(".svg");

      const result = await uploadAProposImageToCloudinary(
        logoFile,
        "portfolio/contact",
        {
          width: 100,
          height: 100,
          crop: "fit",
          quality: "auto:good",
          format: isSvg ? "svg" : "png",
        },
      );

      logoUrl = result.url;

      // Supprimer l'ancien logo
      if (oldLogoPublicId) {
        try {
          await deleteFromCloudinary(oldLogoPublicId);
          console.log("✓ Ancien logo supprimé avec succès");
        } catch (deleteError) {
          console.warn(
            "⚠️ Erreur lors de la suppression de l'ancien logo:",
            deleteError,
          );
        }
      }
    }

    // Mettre à jour le réseau social (garde l'ordre existant)
    const updatedReseau = await prisma.autres_contact.update({
      where: { id_contact: parseInt(id, 10) },
      data: {
        logo: logoUrl,
        nom,
        lien,
        nom_profil: nomProfil,
      },
    });

    revalidatePath("/autres");
    console.log("=== FIN MISE À JOUR RÉSEAU SOCIAL ===");

    return {
      success: true,
      message: "Réseau social mis à jour avec succès",
      data: updatedReseau,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du réseau social:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du réseau social",
    };
  }
}

// Action pour supprimer un réseau social
export async function deleteReseauSocial(id: number) {
  try {
    console.log("=== DÉBUT SUPPRESSION RÉSEAU SOCIAL ===");

    const reseau = await prisma.autres_contact.findUnique({
      where: { id_contact: id },
    });

    if (!reseau) {
      return {
        success: false,
        message: "Réseau social non trouvé",
      };
    }

    // Supprimer le logo de Cloudinary
    if (reseau.logo) {
      const publicId = extractPublicIdFromUrl(reseau.logo);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log("✓ Logo du réseau social supprimé de Cloudinary");
        } catch (deleteError) {
          console.warn(
            "⚠️ Erreur lors de la suppression du logo:",
            deleteError,
          );
        }
      }
    }

    // Supprimer le réseau social
    await prisma.autres_contact.delete({
      where: { id_contact: id },
    });

    revalidatePath("/autres");
    console.log("=== FIN SUPPRESSION RÉSEAU SOCIAL ===");

    return {
      success: true,
      message: "Réseau social supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du réseau social:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du réseau social",
    };
  }
}

// Action pour créer un tag de rôle
export async function createTagRole(formData: FormData) {
  const nom = formData.get("nom") as string;

  try {
    console.log("=== DÉBUT CRÉATION TAG RÔLE ===");

    // Trouver le prochain ordre disponible
    const maxOrdreTag = await prisma.autres_tags_roles.findFirst({
      orderBy: { ordre: "desc" },
      select: { ordre: true },
    });
    const nextOrdre = (maxOrdreTag?.ordre ?? -1) + 1;

    const newTag = await prisma.autres_tags_roles.create({
      data: {
        nom,
        ordre: nextOrdre,
      },
    });

    revalidatePath("/autres");
    console.log("=== FIN CRÉATION TAG RÔLE ===");

    return {
      success: true,
      message: "Tag de rôle créé avec succès",
      data: newTag,
    };
  } catch (error) {
    console.error("Erreur lors de la création du tag de rôle:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du tag de rôle",
    };
  }
}

// Action pour mettre à jour un tag de rôle
export async function updateTagRole(formData: FormData) {
  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;

  try {
    console.log("=== DÉBUT MISE À JOUR TAG RÔLE ===");

    const existingTag = await prisma.autres_tags_roles.findUnique({
      where: { id_tag_role: parseInt(id, 10) },
    });

    if (!existingTag) {
      return {
        success: false,
        message: "Tag de rôle non trouvé",
      };
    }

    // Mettre à jour le tag de rôle (garde l'ordre existant)
    const updatedTag = await prisma.autres_tags_roles.update({
      where: { id_tag_role: parseInt(id, 10) },
      data: {
        nom,
      },
    });

    revalidatePath("/autres");
    console.log("=== FIN MISE À JOUR TAG RÔLE ===");

    return {
      success: true,
      message: "Tag de rôle mis à jour avec succès",
      data: updatedTag,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tag de rôle:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du tag de rôle",
    };
  }
}

// Action pour supprimer un tag de rôle
export async function deleteTagRole(id: number) {
  try {
    console.log("=== DÉBUT SUPPRESSION TAG RÔLE ===");

    const tag = await prisma.autres_tags_roles.findUnique({
      where: { id_tag_role: id },
    });

    if (!tag) {
      return {
        success: false,
        message: "Tag de rôle non trouvé",
      };
    }

    await prisma.autres_tags_roles.delete({
      where: { id_tag_role: id },
    });

    revalidatePath("/autres");
    console.log("=== FIN SUPPRESSION TAG RÔLE ===");

    return {
      success: true,
      message: "Tag de rôle supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du tag de rôle:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du tag de rôle",
    };
  }
}

// Action pour réorganiser les réseaux sociaux
export async function reorderReseauxSociaux(
  reseaux: { id_contact: number; ordre: number }[],
) {
  try {
    console.log("=== DÉBUT RÉORGANISATION RÉSEAUX SOCIAUX ===");

    // Mettre à jour l'ordre de chaque réseau social
    for (const reseau of reseaux) {
      await prisma.autres_contact.update({
        where: { id_contact: reseau.id_contact },
        data: { ordre: reseau.ordre },
      });
    }

    revalidatePath("/autres");
    console.log("=== FIN RÉORGANISATION RÉSEAUX SOCIAUX ===");

    return {
      success: true,
      message: "Ordre des réseaux sociaux mis à jour",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la réorganisation des réseaux sociaux:",
      error,
    );
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la réorganisation des réseaux sociaux",
    };
  }
}

// Action pour réorganiser les tags de rôles
export async function reorderTagsRoles(
  tags: { id_tag_role: number; ordre: number }[],
) {
  try {
    console.log("=== DÉBUT RÉORGANISATION TAGS RÔLES ===");

    // Mettre à jour l'ordre de chaque tag
    for (const tag of tags) {
      await prisma.autres_tags_roles.update({
        where: { id_tag_role: tag.id_tag_role },
        data: { ordre: tag.ordre },
      });
    }

    revalidatePath("/autres");
    console.log("=== FIN RÉORGANISATION TAGS RÔLES ===");

    return {
      success: true,
      message: "Ordre des tags de rôles mis à jour",
    };
  } catch (error) {
    console.error("Erreur lors de la réorganisation des tags de rôles:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la réorganisation des tags de rôles",
    };
  }
}
