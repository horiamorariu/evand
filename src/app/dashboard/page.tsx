import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";
import LogoutButton from "@/components/layout/LogoutButton";

export const dynamic = "force-dynamic";

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  property_address: string;
  created_at: string;
  doc_count: number;
  notes?: string;
}

function dayLabel(isoDate: string, todayStr: string, yesterdayStr: string): string {
  const d = isoDate.slice(0, 10);
  if (d === todayStr) return "Azi";
  if (d === yesterdayStr) return "Ieri";
  return new Date(isoDate).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/auth/login");

  const { uid, profile, agency } = sessionUser;

  let clientsSnap;
  try {
    clientsSnap = await getAdminDb()
      .collection("clients")
      .where("agent_id", "==", uid)
      .orderBy("created_at", "desc")
      .limit(20)
      .get();
  } catch {
    clientsSnap = await getAdminDb()
      .collection("clients")
      .where("agent_id", "==", uid)
      .limit(20)
      .get();
  }

  const clients: ClientRow[] = clientsSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      first_name: d.first_name,
      last_name: d.last_name,
      property_address: d.property_address ?? "",
      created_at: d.created_at?.toDate?.().toISOString() ?? "",
      doc_count: d.doc_count ?? 0,
      notes: d.notes ?? "",
    };
  });

  const grouped: { day: string; label: string; clients: ClientRow[] }[] = [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  for (const client of clients) {
    const day = client.created_at.slice(0, 10);
    const existing = grouped.find((g) => g.day === day);
    if (existing) existing.clients.push(client);
    else grouped.push({ day, label: dayLabel(client.created_at, todayStr, yesterdayStr), clients: [client] });
  }

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

        {/* 2 butoane principale */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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

        {/* Clienți recenți */}
        {clients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Niciun client încă.</p>
            <p className="text-sm">Apasă „Generare documente" pentru a începe.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.day}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group.label}</h2>
                <ul className="space-y-2">
                  {group.clients.map((client) => (
                    <li key={client.id}>
                      <Link
                        href={`/client/${client.id}`}
                        className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                          {client.property_address && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {client.property_address}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(client.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                            {" · "}{client.doc_count} doc.
                            {client.notes && <span className="ml-1">· 📝</span>}
                          </p>
                        </div>
                        <span className="text-gray-300 text-lg">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
