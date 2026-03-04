import type { PropertyStatus } from "@/lib/types";

const statusStyles: Record<PropertyStatus, string> = {
  New: "bg-blue-100 text-blue-700",
  Interested: "bg-yellow-100 text-yellow-700",
  "Second viewing": "bg-orange-100 text-orange-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-500",
};

export default function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}
