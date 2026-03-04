import { createClient } from "@/lib/supabase/server";
import { listProperties } from "@/actions/properties";
import PropertyCard from "@/components/PropertyCard";
import type { PropertyPhoto } from "@/lib/types";
import { signOut } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { data: properties } = await listProperties();
  const supabase = createClient();

  // Fetch cover photos for all properties in one query
  const ids = (properties ?? []).map((p) => p.id);
  let coverPhotos: PropertyPhoto[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("property_photos")
      .select("*")
      .in("property_id", ids)
      .order("created_at", { ascending: true });
    coverPhotos = data ?? [];
  }

  const q = searchParams.q?.toLowerCase() ?? "";
  const filtered = (properties ?? []).filter((p) => {
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      (p.notes?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 z-10 px-4 pt-10 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Search */}
        <form method="GET">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search title, area, notes…"
              className="w-full rounded-xl bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </form>
      </div>

      {/* List */}
      <div className="px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏡</div>
            <p className="font-medium">
              {q ? "No properties match your search." : "No properties yet."}
            </p>
            {!q && (
              <p className="text-sm mt-1">Tap + to add your first one!</p>
            )}
          </div>
        ) : (
          filtered.map((property) => {
            const cover = coverPhotos.find(
              (ph) => ph.property_id === property.id
            );
            return (
              <PropertyCard
                key={property.id}
                property={property}
                coverPhoto={cover}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
