"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PropertyWithPhotos } from "@/lib/types";
import { PROPERTY_STATUSES } from "@/lib/types";
import type { PropertyStatus } from "@/lib/types";
import { createProperty, updateProperty } from "@/actions/properties";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });
const PhotoUploader = dynamic(() => import("./PhotoUploader"), { ssr: false });

const statusLabels: Record<PropertyStatus, string> = {
  New:              "Nieuw",
  Interested:       "Interessant",
  "Second viewing": "Tweede bezichtiging",
  Offer:            "Bod",
  Rejected:         "Afgewezen",
};

interface Props {
  property?: PropertyWithPhotos;
  userId: string;
}

export default function PropertyForm({ property, userId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [lat, setLat] = useState<number | null>(property?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(property?.longitude ?? null);

  function handleLocationChange(newLat: number, newLng: number) {
    if (newLat === 0 && newLng === 0) {
      setLat(null);
      setLng(null);
    } else {
      setLat(newLat);
      setLng(newLng);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      title: fd.get("title") as string,
      area: fd.get("area") as string,
      asking_price: fd.get("asking_price") as string,
      status: fd.get("status") as string,
      notes: fd.get("notes") as string,
      contact_name: fd.get("contact_name") as string,
      agency: fd.get("agency") as string,
      url: fd.get("url") as string,
      viewed_date: fd.get("viewed_date") as string,
      latitude: lat,
      longitude: lng,
      address_label: fd.get("address_label") as string,
    };

    startTransition(async () => {
      const result = property
        ? await updateProperty(property.id, payload as never)
        : await createProperty(payload as never);

      if (result.error) {
        setError(result.error);
      } else {
        router.push(property ? `/properties/${property.id}` : `/properties/${result.data!.id}`);
      }
    });
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-sand-50 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terra-400 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5">
      {/* Naam */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Naam <span className="text-rose-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={property?.title}
          placeholder="bijv. Herenhuis bij Estepona"
          className={inputClass}
        />
      </div>

      {/* Stad / Regio */}
      <div>
        <label htmlFor="area" className={labelClass}>
          Stad / Regio <span className="text-rose-400">*</span>
        </label>
        <input
          id="area"
          name="area"
          required
          defaultValue={property?.area}
          placeholder="bijv. Estepona / Javea"
          className={inputClass}
        />
      </div>

      {/* Vraagprijs + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="asking_price" className={labelClass}>
            Vraagprijs (€)
          </label>
          <input
            id="asking_price"
            name="asking_price"
            type="number"
            min={0}
            step={1000}
            defaultValue={property?.asking_price ?? ""}
            placeholder="350000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={property?.status ?? "New"}
            className={inputClass}
          >
            {PROPERTY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bezichtigd op */}
      <div>
        <label htmlFor="viewed_date" className={labelClass}>
          Bezichtigd op
        </label>
        <input
          id="viewed_date"
          name="viewed_date"
          type="date"
          defaultValue={property?.viewed_date ?? ""}
          className={inputClass}
        />
      </div>

      {/* Notities */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notities
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={property?.notes ?? ""}
          placeholder="Eerste indruk, voor- en nadelen…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Contactpersoon + Makelaar */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="contact_name" className={labelClass}>
            Contactpersoon
          </label>
          <input
            id="contact_name"
            name="contact_name"
            defaultValue={property?.contact_name ?? ""}
            placeholder="María García"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="agency" className={labelClass}>
            Makelaar
          </label>
          <input
            id="agency"
            name="agency"
            defaultValue={property?.agency ?? ""}
            placeholder="Engel & Völkers"
            className={inputClass}
          />
        </div>
      </div>

      {/* Link naar advertentie */}
      <div>
        <label htmlFor="url" className={labelClass}>
          Link naar advertentie
        </label>
        <input
          id="url"
          name="url"
          type="url"
          defaultValue={property?.url ?? ""}
          placeholder="https://idealista.com/…"
          className={inputClass}
        />
      </div>

      {/* Locatie */}
      <div>
        <label className={labelClass}>Locatie</label>
        <LocationPicker
          initialLat={lat}
          initialLng={lng}
          onChange={handleLocationChange}
        />
        <div className="mt-2">
          <input
            name="address_label"
            defaultValue={property?.address_label ?? ""}
            placeholder="Adresomschrijving (optioneel)"
            className={`${inputClass} text-sm`}
          />
        </div>
        {lat && lng && (
          <p className="text-xs text-stone-400 mt-1.5">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Foto's */}
      {property && (
        <div>
          <label className={labelClass}>Foto&apos;s</label>
          <PhotoUploader
            propertyId={property.id}
            userId={userId}
            existingPhotos={property.property_photos}
          />
        </div>
      )}

      {!property && (
        <p className="text-xs text-stone-400 bg-sand-100 rounded-xl p-3.5 leading-relaxed">
          Je kunt foto&apos;s toevoegen nadat je het huis hebt opgeslagen.
        </p>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm rounded-xl px-4 py-3 border border-rose-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-terra-500 hover:bg-terra-600 text-white font-semibold py-4 rounded-xl text-base transition-colors disabled:opacity-60"
      >
        {isPending
          ? "Opslaan…"
          : property
          ? "Wijzigingen opslaan"
          : "Huis toevoegen"}
      </button>
    </form>
  );
}
