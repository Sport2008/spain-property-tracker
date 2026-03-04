import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProperty } from "@/actions/properties";
import PropertyForm from "@/components/PropertyForm";

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: property, error } = await getProperty(params.id);
  if (!property || error) notFound();

  return (
    <div>
      <div className="sticky top-0 bg-sand-50 z-10 px-4 pt-10 pb-3 flex items-center gap-3">
        <Link href={`/properties/${params.id}`} className="text-stone-400 p-1 -ml-1 hover:text-stone-600 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-stone-900">Huis bewerken</h1>
      </div>
      <PropertyForm property={property} userId={user.id} />
    </div>
  );
}
