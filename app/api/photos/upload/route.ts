import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-session";
import { addPhotoAction } from "@/actions/photos-actions";

export const maxDuration = 300; // Allows the function to run longer on Vercel

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) throw new Error("AuthRequiredError");

    const formData = await request.formData();

    // Call the action via API Route to preserve cookies
    const result = await addPhotoAction(formData);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erreur API Upload Photo:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur interne" },
      { status: error.name === "AuthRequiredError" ? 401 : 500 },
    );
  }
}
