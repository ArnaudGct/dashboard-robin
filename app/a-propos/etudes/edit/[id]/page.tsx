import { notFound } from "next/navigation";
import { EditEtude } from "@/components/sections/a-propos/etudes/edit-etude";
import { getEtudeByIdAction } from "@/actions/a-propos_etudes-actions";

export const dynamic = "force-dynamic";

interface EditEtudePageProps {
  params: {
    id: string;
  };
}

export default async function EditEtudePage({ params }: EditEtudePageProps) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  if (isNaN(id)) {
    notFound();
  }

  const etude = await getEtudeByIdAction(id);

  if (!etude) {
    notFound();
  }

  return <EditEtude initialData={etude} />;
}
