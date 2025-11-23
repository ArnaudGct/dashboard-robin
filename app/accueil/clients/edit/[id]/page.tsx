import { notFound } from "next/navigation";
import { EditClientItem } from "@/components/sections/accueil/clients/edit-client-item";
import prisma from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export default async function EditClientPage({ params }: { params: Params }) {
  const { id } = await params;
  const clientId = parseInt(id);

  if (isNaN(clientId)) {
    notFound();
  }

  const clientEntry = await prisma.clients.findUnique({
    where: {
      id_client: clientId,
    },
  });

  if (!clientEntry) {
    notFound();
  }

  return (
    <section className="w-[90%] mx-auto mb-8">
      <EditClientItem initialData={clientEntry} />
    </section>
  );
}
