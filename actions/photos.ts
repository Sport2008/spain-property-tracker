"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePhotoRecord(
  propertyId: string,
  storagePath: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("property_photos").insert({
    property_id: propertyId,
    user_id: user.id,
    storage_path: storagePath,
  });

  if (!error) revalidatePath(`/properties/${propertyId}`);

  return { error: error?.message ?? null };
}

export async function deletePhoto(
  photoId: string,
  storagePath: string,
  propertyId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Remove from storage
  const { error: storageError } = await supabase.storage
    .from("property-photos")
    .remove([storagePath]);

  if (storageError) return { error: storageError.message };

  // Remove DB record
  const { error: dbError } = await supabase
    .from("property_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (!dbError) revalidatePath(`/properties/${propertyId}`);

  return { error: dbError?.message ?? null };
}
