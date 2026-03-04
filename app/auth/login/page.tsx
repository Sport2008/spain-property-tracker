"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LAST_EMAIL_KEY = "last_email";
const LAST_EMAIL_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const COOLDOWN_SECONDS = 30;

type PageState = "checking" | "login" | "sent";

export default function LoginPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("checking");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: check for an existing session and redirect immediately if found.
  // Also pre-fill the last used email address if it is less than 14 days old.
  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/properties");
        return;
      }

      // Pre-fill email from localStorage if fresh enough
      try {
        const raw = localStorage.getItem(LAST_EMAIL_KEY);
        if (raw) {
          const { value, ts } = JSON.parse(raw) as { value: string; ts: number };
          if (Date.now() - ts < LAST_EMAIL_MAX_AGE_MS) {
            setEmail(value);
          }
        }
      } catch {
        // ignore parse errors
      }

      setPageState("login");
    }

    checkSession();

    // Also listen for auth state changes (e.g. magic link opens in same tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          router.replace("/properties");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Clean up cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;
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
    } else {
      // Persist the email so we can pre-fill it next time
      try {
        localStorage.setItem(LAST_EMAIL_KEY, JSON.stringify({ value: email, ts: Date.now() }));
      } catch {
        // ignore storage errors
      }
      setPageState("sent");
      startCooldown();
    }
    setLoading(false);
  }

  if (pageState === "checking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sand-50 px-4">
        <div className="text-5xl mb-4">🏡</div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight mb-6">Spanjehuizen</h1>
        <p className="text-stone-500 text-sm">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-sand-50 px-5 py-safe-or-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏡</div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Spanjehuizen</h1>
          <p className="text-stone-500 mt-2 text-sm">Houd huizen bij die je in Spanje bekijkt</p>
        </div>

        {pageState === "sent" ? (
          <div className="bg-white rounded-2xl shadow-warm p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Controleer je e-mail</h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              We hebben een inloglink gestuurd naar{" "}
              <span className="font-medium text-stone-700">{email}</span>.
              Klik erop om in te loggen.
            </p>
            <button
              onClick={() => {
                if (cooldown === 0) {
                  setPageState("login");
                }
              }}
              disabled={cooldown > 0}
              className="mt-6 text-sm text-terra-600 underline underline-offset-2 disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0
                ? `Opnieuw versturen over ${cooldown}s`
                : "Probeer een ander e-mailadres"}
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
                inputMode="email"
                placeholder="jij@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-sand-50 px-4 py-3.5 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terra-400 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-rose-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-terra-500 hover:bg-terra-600 active:bg-terra-700 text-white font-semibold py-4 rounded-xl text-base transition-colors disabled:opacity-60"
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
