import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "./admin";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "./constants";
import type { Profile, Agency } from "@/types";

export { SESSION_COOKIE, SESSION_DURATION_MS };

export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });
}

export async function getSessionUser(): Promise<{
  uid: string;
  profile: Profile;
  agency: Agency;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const db = getAdminDb();
    const profileSnap = await db.collection("profiles").doc(uid).get();
    if (!profileSnap.exists) return null;

    const profileData = profileSnap.data()!;
    const agencySnap = await db
      .collection("agencies")
      .doc(profileData.agency_id)
      .get();
    if (!agencySnap.exists) return null;

    const profile: Profile = {
      id: uid,
      agency_id: profileData.agency_id,
      full_name: profileData.full_name,
      email: profileData.email,
      role: profileData.role,
      phone: profileData.phone,
      created_at: profileData.created_at?.toDate?.().toISOString() ?? "",
    };

    const agencyData = agencySnap.data()!;
    const agency: Agency = {
      id: agencySnap.id,
      name: agencyData.name,
      cui: agencyData.cui,
      address: agencyData.address,
      phone: agencyData.phone,
      email: agencyData.email,
      logo_url: agencyData.logo_url,
      created_at: agencyData.created_at?.toDate?.().toISOString() ?? "",
    };

    return { uid, profile: { ...profile, agency }, agency };
  } catch {
    return null;
  }
}
