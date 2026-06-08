"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, AuthErrorCodes } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("session");

      // Full page load — evită conflictul dintre router.push() și router.refresh()
      // când proxy-ul redirecționează /auth/login → /dashboard cu cookie-ul nou setat
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === AuthErrorCodes.INVALID_PASSWORD ||
        code === AuthErrorCodes.USER_DELETED ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials"
      ) {
        setError("Email sau parolă incorectă.");
      } else if (code === AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER) {
        setError("Prea multe încercări. Încearcă din nou mai târziu.");
      } else {
        setError("A apărut o eroare. Încearcă din nou.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Evand</h1>
          <p className="mt-1 text-sm text-gray-500">Documente imobiliare instant</p>
        </div>

        {/* form fără onSubmit — butonul e type="button" cu onClick */}
        {/* previne native form submit înainte de hidratare React */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="agent@agentie.ro"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parolă
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Se conectează..." : "Intră în cont"}
          </button>
        </div>
      </div>
    </div>
  );
}
