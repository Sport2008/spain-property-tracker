"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PropertyWithPhotos } from "@/lib/types";
import { PROPERTY_STATUSES } from "@/lib/types";
import { createProperty, updateProperty } from "@/actions/properties";
const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });
const PhotoUploader = dynamic(() => import("./PhotoUploader"), { ssr: false });

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
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={property?.title}
          placeholder="e.g. Townhouse near Estepona"
          className={inputClass}
        />
      </div>

      {/* Area */}
      <div>
        <label htmlFor="area" className={labelClass}>
          City / Area <span className="text-red-500">*</span>
        </label>
        <input
          id="area"
          name="area"
          required
          defaultValue={property?.area}
          placeholder="e.g. Estepona / Javea"
          className={inputClass}
        />
      </div>

      {/* Price + Status side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="asking_price" className={labelClass}>
            Asking price (€)
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
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Viewed date */}
      <div>
        <label htmlFor="viewed_date" className={labelClass}>
          Date viewed
        </label>
        <input
          id="viewed_date"
          name="viewed_date"
          type="date"
          defaultValue={property?.viewed_date ?? ""}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={property?.notes ?? ""}
          placeholder="First impressions, pros/cons…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="contact_name" className={labelClass}>
            Contact
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
            Agency
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

      {/* URL */}
      <div>
        <label htmlFor="url" className={labelClass}>
          Listing URL
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

      {/* Location */}
      <div>
        <label className={labelClass}>Location</label>
        <LocationPicker
          initialLat={lat}
          initialLng={lng}
          onChange={handleLocationChange}
        />
        <div className="mt-2">
          <input
            name="address_label"
            defaultValue={property?.address_label ?? ""}
            placeholder="Address label (optional)"
            className={`${inputClass} text-sm`}
          />
        </div>
        {lat && lng && (
          <p className="text-xs text-gray-400 mt-1">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Photos (only available when editing an existing property) */}
      {property && (
        <div>
          <label className={labelClass}>Photos</label>
          <PhotoUploader
            propertyId={property.id}
            userId={userId}
            existingPhotos={property.property_photos}
          />
        </div>
      )}

      {!property && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
          You can add photos after saving the property.
        </p>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl text-base transition disabled:opacity-60"
      >
        {isPending
          ? "Saving…"
          : property
          ? "Save changes"
          : "Add property"}
      </button>
    </form>
  );
}
