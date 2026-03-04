"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSubmitted(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏡</div>
          <h1 className="text-2xl font-bold text-gray-900">Spanjehuizen</h1>
          <p className="text-gray-500 mt-1 text-sm">Track properties you view in Spain</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Check your email</h2>
            <p className="text-gray-500 text-sm">
              We sent a magic link to <span className="font-medium text-gray-700">{email}</span>.
              Click it to sign in.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); }}
              className="mt-4 text-sm text-orange-600 underline"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-base transition disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              No password needed — we&apos;ll email you a sign-in link.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
