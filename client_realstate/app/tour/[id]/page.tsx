import VirtualTour from "@/components/VirtualTour";

export default async function TourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VirtualTour room={id} />;
}