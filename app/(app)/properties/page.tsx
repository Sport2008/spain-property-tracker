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
      <div className="sticky top-0 bg-sand-50 z-10 px-4 pt-10 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Huizen</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-stone-400 px-3 py-1.5 rounded-lg border border-stone-200 bg-white transition-colors hover:text-stone-600"
            >
              Uitloggen
            </button>
          </form>
        </div>

        {/* Zoekbalk */}
        <form method="GET">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Zoek op naam, regio, notities…"
              className="w-full rounded-xl bg-white border border-stone-200 pl-9 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terra-400 focus:border-transparent transition"
            />
          </div>
        </form>
      </div>

      {/* Lijst */}
      <div className="px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">🏡</div>
            <p className="font-medium text-stone-500">
              {q ? "Geen huizen gevonden." : "Nog geen huizen."}
            </p>
            {!q && (
              <p className="text-sm mt-1 text-stone-400">Tik op + om je eerste huis toe te voegen!</p>
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
