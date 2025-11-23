"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "@/lib/cloudinary";

// Ajouter un client
export async function addClientAction(formData: FormData) {
  try {
    const client = formData.get("client")?.toString();
    const logo = formData.get("logo")?.toString() || "";
    const alt_logo = formData.get("alt_logo")?.toString();
    const afficher = formData.get("afficher") === "on";

    if (!client || !alt_logo) {
      return { success: false, error: "Tous les champs sont requis." };
    }

    let logoUrl = "";

    // Si un logo est uploadé
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      console.log("Upload logo client...");
      const result = await uploadToCloudinary(
        logoFile,
        "high",
        "portfolio/clients/logos"
      );
      logoUrl = result.url;
      console.log("Logo client uploadé:", logoUrl);
    }

    await prisma.clients.create({
      data: {
        client,
        logo: logoUrl,
        alt_logo,
        afficher,
      },
    });

    revalidatePath("/accueil/clients");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout du client:", error);
    return { success: false, error: "Une erreur s'est produite." };
  }
}

// Mettre à jour un client
export async function updateClientAction(formData: FormData) {
  try {
    const id = parseInt(formData.get("id")?.toString() || "0");
    if (!id) throw new Error("ID manquant");

    const client = formData.get("client")?.toString();
    const logo = formData.get("logo")?.toString() || "";
    const alt_logo = formData.get("alt_logo")?.toString();
    const afficher = formData.get("afficher") === "on";

    if (!client || !alt_logo) {
      return { success: false, error: "Tous les champs sont requis." };
    }

    let logoUrl = "";

    // Si un logo est uploadé
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      console.log("Upload logo client...");

      // Récupérer l'ancien logo pour suppression
      const existingClient = await prisma.clients.findUnique({
        where: { id_client: id },
      });
      if (existingClient?.logo) {
        const oldLogoPublicId = extractPublicIdFromUrl(existingClient.logo);
        if (oldLogoPublicId) {
          try {
            await deleteFromCloudinary(oldLogoPublicId);
            console.log("Ancien logo supprimé de Cloudinary");
          } catch (deleteError) {
            console.warn(
              "Erreur lors de la suppression de l'ancien logo:",
              deleteError
            );
          }
        }
      }

      // Uploader le nouveau logo
      const result = await uploadToCloudinary(
        logoFile,
        "high",
        "portfolio/clients/logos"
      );
      logoUrl = result.url;
      console.log("Logo client uploadé:", logoUrl);
    } else {
      // Conserver l'ancien logo si aucun nouveau n'est uploadé
      const existingClient = await prisma.clients.findUnique({
        where: { id_client: id },
      });
      logoUrl = existingClient?.logo || "";
    }

    await prisma.clients.update({
      where: { id_client: id },
      data: { client, logo: logoUrl, alt_logo, afficher },
    });

    revalidatePath("/accueil/clients");
    revalidatePath(`/accueil/clients/edit/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error);
    return { success: false, error: "Une erreur s'est produite." };
  }
}

// Supprimer un client
export async function deleteClientAction(id: number) {
  try {
    if (!id) throw new Error("ID manquant");

    await prisma.clients.delete({
      where: { id_client: id },
    });

    revalidatePath("/accueil/clients");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    return { success: false, error: "Une erreur s'est produite." };
  }
}
