import { notFound } from "next/navigation";
import { EditExperience } from "@/components/sections/a-propos/experiences/edit-experience";
import { getExperienceByIdAction } from "@/actions/a-propos_experiences-actions";

export const dynamic = "force-dynamic";

interface EditExperiencePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExperiencePage({
  params,
}: EditExperiencePageProps) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  if (isNaN(id)) {
    notFound();
  }

  const experience = await getExperienceByIdAction(id);

  if (!experience) {
    notFound();
  }

  return <EditExperience initialData={experience} />;
}
