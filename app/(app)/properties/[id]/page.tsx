import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { getProperty, deleteProperty } from "@/actions/properties";
import StatusBadge from "@/components/StatusBadge";
import PhotoGallery from "@/components/PhotoGallery";

export const dynamic = "force-dynamic";

const MapPreview = dynamicImport(() => import("@/components/MapPreview"), {
  ssr: false,
});

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: property, error } = await getProperty(params.id);
  if (!property || error) notFound();

  const photoUrls = property.property_photos.map((ph) => {
    const { data } = supabase.storage
      .from("property-photos")
      .getPublicUrl(ph.storage_path);
    return data.publicUrl;
  });

  async function handleDelete() {
    "use server";
    await deleteProperty(params.id);
    redirect("/properties");
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-sand-50 z-10 px-4 pt-10 pb-3 flex items-center justify-between">
        <Link href="/properties" className="text-stone-400 p-1 -ml-1 hover:text-stone-600 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/properties/${property.id}/edit`}
            className="px-4 py-2 rounded-xl bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold transition-colors"
          >
            Bewerken
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-500 text-sm font-semibold hover:bg-rose-50 transition-colors"
            >
              Verwijderen
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Titel + status */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-xl font-bold text-stone-900 flex-1 leading-snug">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="text-stone-500 text-sm">{property.area}</p>
        </div>

        {/* Foto's */}
        {photoUrls.length > 0 && <PhotoGallery urls={photoUrls} />}

        {/* Vraagprijs + Bezichtigd op */}
        <div className="flex gap-3">
          {property.asking_price && (
            <div className="bg-terra-50 rounded-2xl px-4 py-3.5 flex-1">
              <p className="text-xs text-stone-500 mb-0.5">Vraagprijs</p>
              <p className="text-terra-600 font-bold text-lg">
                {formatPrice(property.asking_price)}
              </p>
            </div>
          )}
          {property.viewed_date && (
            <div className="bg-sand-100 rounded-2xl px-4 py-3.5 flex-1">
              <p className="text-xs text-stone-500 mb-0.5">Bezichtigd op</p>
              <p className="font-semibold text-stone-800 text-sm">
                {formatDate(property.viewed_date)}
              </p>
            </div>
          )}
        </div>

        {/* Notities */}
        {property.notes && (
          <div>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              Notities
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
              {property.notes}
            </p>
          </div>
        )}

        {/* Contactpersoon */}
        {(property.contact_name || property.agency) && (
          <div>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              Contactpersoon
            </h2>
            <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-100 shadow-warm">
              {property.contact_name && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-stone-400">Naam</span>
                  <span className="text-sm font-medium text-stone-800">
                    {property.contact_name}
                  </span>
                </div>
              )}
              {property.agency && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-stone-400">Makelaar</span>
                  <span className="text-sm font-medium text-stone-800">
                    {property.agency}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link naar advertentie */}
        {property.url && (
          <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-terra-500 underline underline-offset-2 text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Bekijk originele advertentie
          </a>
        )}

        {/* Locatie */}
        {property.latitude && property.longitude && (
          <div>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              Locatie
            </h2>
            {property.address_label && (
              <p className="text-sm text-stone-600 mb-2">{property.address_label}</p>
            )}
            <MapPreview
              lat={property.latitude}
              lng={property.longitude}
              title={property.title}
            />
          </div>
        )}

        {/* Metadata */}
        <p className="text-xs text-stone-300 text-center pt-2">
          Toegevoegd {formatDate(property.created_at)}
        </p>
      </div>
    </div>
  );
}
