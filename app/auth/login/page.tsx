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
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏡</div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Spanjehuizen</h1>
          <p className="text-stone-500 mt-2 text-sm">Houd huizen bij die je in Spanje bekijkt</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl shadow-warm p-7 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Controleer je e-mail</h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              We hebben een inloglink gestuurd naar{" "}
              <span className="font-medium text-stone-700">{email}</span>.
              Klik erop om in te loggen.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); }}
              className="mt-5 text-sm text-terra-600 underline underline-offset-2"
            >
              Probeer een ander e-mailadres
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-warm p-7 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="jij@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-sand-50 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terra-400 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-rose-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-terra-500 hover:bg-terra-600 text-white font-semibold py-3.5 rounded-xl text-base transition-colors disabled:opacity-60"
            >
              {loading ? "Bezig met versturen…" : "Stuur inloglink"}
            </button>

            <p className="text-xs text-stone-400 text-center leading-relaxed">
              Geen wachtwoord nodig — we sturen je een inloglink per e-mail.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
