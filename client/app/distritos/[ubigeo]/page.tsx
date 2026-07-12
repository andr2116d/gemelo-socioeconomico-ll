import VistaDistrito from "@/components/VistaDistrito";

export default async function PaginaDistrito({
  params,
}: {
  params: Promise<{ ubigeo: string }>;
}) {
  const { ubigeo } = await params;
  return <VistaDistrito ubigeo={ubigeo} />;
}
