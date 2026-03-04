export type PropertyStatus =
  | "New"
  | "Interested"
  | "Second viewing"
  | "Offer"
  | "Rejected";

export const PROPERTY_STATUSES: PropertyStatus[] = [
  "New",
  "Interested",
  "Second viewing",
  "Offer",
  "Rejected",
];

export interface Property {
  id: string;
  user_id: string;
  title: string;
  area: string;
  asking_price: number | null;
  status: PropertyStatus;
  notes: string | null;
  contact_name: string | null;
  agency: string | null;
  url: string | null;
  viewed_date: string | null;
  latitude: number | null;
  longitude: number | null;
  address_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
}

export interface PropertyWithPhotos extends Property {
  property_photos: PropertyPhoto[];
}
