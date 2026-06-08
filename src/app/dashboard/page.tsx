import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/session";
import LogoutButton from "@/components/layout/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/auth/login");

  const { profile, agency } = sessionUser;

  const now = new Date();
  const todayFormatted = now.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Evand</h1>
          <p className="text-xs text-gray-500">{agency.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{profile.full_name}</span>
          {profile.role === "admin" && (
            <a href="/admin" className="text-xs text-blue-600 hover:underline font-medium">Admin</a>
          )}
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <p className="text-xs text-gray-400 capitalize mb-4">{todayFormatted}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/client/new"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-5 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="text-2xl">📄</span>
            <span className="text-sm font-semibold">Generare documente</span>
          </Link>
          <Link
            href="/history"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-4 py-5 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
          >
            <span className="text-2xl">📋</span>
            <span className="text-sm font-semibold">Istoric</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
