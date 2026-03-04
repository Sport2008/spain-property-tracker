import type { PropertyStatus } from "@/lib/types";

const statusStyles: Record<PropertyStatus, string> = {
  New:              "bg-sky-100 text-sky-700",
  Interested:       "bg-amber-100 text-amber-700",
  "Second viewing": "bg-orange-100 text-orange-700",
  Offer:            "bg-emerald-100 text-emerald-700",
  Rejected:         "bg-rose-100 text-rose-600",
};

const statusLabels: Record<PropertyStatus, string> = {
  New:              "Nieuw",
  Interested:       "Interessant",
  "Second viewing": "Tweede bezichtiging",
  Offer:            "Bod",
  Rejected:         "Afgewezen",
};

export default function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
