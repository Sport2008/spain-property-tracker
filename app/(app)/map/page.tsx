import dynamicImport from "next/dynamic";
import { listProperties } from "@/actions/properties";

export const dynamic = "force-dynamic";

const MapAllProperties = dynamicImport(() => import("@/components/MapAllProperties"), {
  ssr: false,
});

export default async function MapPage() {
  const { data: properties } = await listProperties();

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 pt-10 pb-3">
        <h1 className="text-2xl font-bold text-gray-900">Map</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {(properties ?? []).filter((p) => p.latitude).length} properties with location
        </p>
      </div>
      <div className="flex-1 px-4 pb-20">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <MapAllProperties properties={properties ?? []} />
        </div>
      </div>
    </div>
  );
}
