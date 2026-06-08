import { readFileSync } from "fs";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

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

const app = getApps().length === 0
  ? initializeApp({ credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    })})
  : getApps()[0];

async function run() {
  const db = getFirestore(app);
  const uid = "SsSG3fTL1zceBqfJVD9e0YzGqYw2";

  const profileRef = db.collection("profiles").doc(uid);
  if (!(await profileRef.get()).exists) {
    await profileRef.set({
      agency_id: "agency-evand-test",
      full_name: "Test Agent",
      email: "test@evand.ro",
      role: "agent",
      created_at: Timestamp.now(),
    });
    console.log("[+] Profil creat pentru test@evand.ro");
  } else {
    console.log("[=] Profil existent");
  }
}

run().catch(e => { console.error(e.message); process.exit(1); });
