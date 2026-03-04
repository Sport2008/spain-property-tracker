"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Property, PropertyWithPhotos } from "@/lib/types";

const PropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  area: z.string().min(1, "Area is required"),
  asking_price: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable()
  ),
  status: z.enum(["New", "Interested", "Second viewing", "Offer", "Rejected"]),
  notes: z.string().optional().nullable(),
  contact_name: z.string().optional().nullable(),
  agency: z.string().optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  viewed_date: z.string().optional().nullable(),
  latitude: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().nullable()
  ),
  longitude: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().nullable()
  ),
  address_label: z.string().optional().nullable(),
});

export type PropertyFormData = z.infer<typeof PropertySchema>;

export async function listProperties(): Promise<{
  data: Property[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function getProperty(id: string): Promise<{
  data: PropertyWithPhotos | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_photos(*)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createProperty(
  formData: PropertyFormData
): Promise<{ data: Property | null; error: string | null }> {
  const parsed = PropertySchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (!error) revalidatePath("/properties");

  return { data, error: error?.message ?? null };
}

export async function updateProperty(
  id: string,
  formData: PropertyFormData
): Promise<{ data: Property | null; error: string | null }> {
  const parsed = PropertySchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("properties")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
  }

  return { data, error: error?.message ?? null };
}

export async function deleteProperty(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/properties");

  return { error: error?.message ?? null };
}
