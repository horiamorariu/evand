/**
 * Seed script — populează Firestore cu agenția de test și profilul admin.
 * Rulare: npx tsx scripts/seed.ts
 * Idempotent: nu suprascrie documentele existente.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Încarcă .env.local înainte de initializeApp
const envRaw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  process.env[key] = value;
}

// ─── Configurare ────────────────────────────────────────────────────────────
const USER_UID = "1jeHLtrfNiX8GOKnU2kc9mmxppP2";  // UID din Firebase Auth (morariuhoria@gmail.com)
const USER_EMAIL = "morariuhoria@gmail.com";
const USER_NAME = "Horia Morariu";
const AGENCY_ID = "agency-evand-test";          // ID fix — seed idempotent
// ────────────────────────────────────────────────────────────────────────────

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];

const db = getFirestore(app);

async function seed() {
  console.log("Seeding Firestore...\n");

  // 1. Agenție
  const agencyRef = db.collection("agencies").doc(AGENCY_ID);
  if (!(await agencyRef.get()).exists) {
    await agencyRef.set({
      name: "Evand Test",
      cui: "RO00000001",
      address: "Str. Florilor nr. 1, Cluj-Napoca",
      phone: "+40700000000",
      email: USER_EMAIL,
      created_at: Timestamp.now(),
    });
    console.log(`[+] Agentie creata  : agencies/${AGENCY_ID}`);
  } else {
    console.log(`[=] Agentie existenta: agencies/${AGENCY_ID}`);
  }

  // 2. Profil admin
  const profileRef = db.collection("profiles").doc(USER_UID);
  if (!(await profileRef.get()).exists) {
    await profileRef.set({
      agency_id: AGENCY_ID,
      full_name: USER_NAME,
      email: USER_EMAIL,
      role: "admin",
      created_at: Timestamp.now(),
    });
    console.log(`[+] Profil creat    : profiles/${USER_UID}`);
  } else {
    console.log(`[=] Profil existent : profiles/${USER_UID}`);
  }

  console.log("\nDone.");
}

seed().catch((err) => {
  console.error("\nSeed esuat:", err.message);
  process.exit(1);
});
