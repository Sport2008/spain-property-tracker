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

  // Build public URLs for photos
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
      <div className="sticky top-0 bg-gray-50 z-10 px-4 pt-10 pb-3 flex items-center justify-between">
        <Link href="/properties" className="text-gray-500 p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/properties/${property.id}/edit`}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold"
          >
            Edit
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Title + status */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900 flex-1">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="text-gray-500 text-sm">{property.area}</p>
        </div>

        {/* Photos */}
        {photoUrls.length > 0 && <PhotoGallery urls={photoUrls} />}

        {/* Price + date */}
        <div className="flex gap-4">
          {property.asking_price && (
            <div className="bg-orange-50 rounded-xl px-4 py-3 flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Asking price</p>
              <p className="text-orange-600 font-bold text-lg">
                {formatPrice(property.asking_price)}
              </p>
            </div>
          )}
          {property.viewed_date && (
            <div className="bg-gray-100 rounded-xl px-4 py-3 flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Viewed on</p>
              <p className="font-semibold text-gray-800 text-sm">
                {formatDate(property.viewed_date)}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {property.notes && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Notes
            </h2>
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
              {property.notes}
            </p>
          </div>
        )}

        {/* Contact info */}
        {(property.contact_name || property.agency) && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Contact
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
              {property.contact_name && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-medium text-gray-800">
                    {property.contact_name}
                  </span>
                </div>
              )}
              {property.agency && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Agency</span>
                  <span className="text-sm font-medium text-gray-800">
                    {property.agency}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listing URL */}
        {property.url && (
          <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-orange-500 underline text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View original listing
          </a>
        )}

        {/* Map preview */}
        {property.latitude && property.longitude && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Location
            </h2>
            {property.address_label && (
              <p className="text-sm text-gray-600 mb-2">{property.address_label}</p>
            )}
            <MapPreview
              lat={property.latitude}
              lng={property.longitude}
              title={property.title}
            />
          </div>
        )}

        {/* Metadata */}
        <p className="text-xs text-gray-300 text-center pt-2">
          Added {formatDate(property.created_at)}
        </p>
      </div>
    </div>
  );
}
