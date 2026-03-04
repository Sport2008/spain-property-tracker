import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import Link from "next/link";

export default async function NewPropertyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div>
      <div className="sticky top-0 bg-gray-50 z-10 px-4 pt-10 pb-3 flex items-center gap-3">
        <Link href="/properties" className="text-gray-500 p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add property</h1>
      </div>
      <PropertyForm userId={user.id} />
    </div>
  );
}
