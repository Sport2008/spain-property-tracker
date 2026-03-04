import Link from "next/link";
import Image from "next/image";
import type { Property, PropertyPhoto } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { createClient } from "@/lib/supabase/server";

interface Props {
  property: Property;
  coverPhoto?: PropertyPhoto;
}

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
    month: "short",
    year: "numeric",
  });
}

export default async function PropertyCard({ property, coverPhoto }: Props) {
  let photoUrl: string | null = null;

  if (coverPhoto) {
    const supabase = createClient();
    const { data } = supabase.storage
      .from("property-photos")
      .getPublicUrl(coverPhoto.storage_path);
    photoUrl = data?.publicUrl ?? null;
  }

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-warm active:scale-[0.98] transition-transform">
        {/* Photo */}
        <div className="relative w-full h-44 bg-sand-100">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 flex-1">
              {property.title}
            </h2>
            <StatusBadge status={property.status} />
          </div>

          <p className="text-sm text-stone-500 mt-1">{property.area}</p>

          <div className="flex items-center justify-between mt-3">
            {property.asking_price ? (
              <span className="text-terra-600 font-bold text-base">
                {formatPrice(property.asking_price)}
              </span>
            ) : (
              <span className="text-stone-300 text-sm">Prijs onbekend</span>
            )}
            <span className="text-xs text-stone-400">
              {formatDate(property.viewed_date ?? property.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
