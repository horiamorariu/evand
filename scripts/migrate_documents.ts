import { readFileSync } from "fs";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
  ? initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") }) })
  : getApps()[0];

const db = getFirestore(app);

async function migrate() {
  console.log("Migrare documente...\n");

  // Adaugă agency_id la documente care nu au
  const docsSnap = await db.collection("documents").get();
  let updated = 0;

  for (const doc of docsSnap.docs) {
    const data = doc.data();
    if (data.agency_id) continue;

    // Găsește agency_id din profilul agentului
    const profileSnap = await db.collection("profiles").doc(data.agent_id).get();
    if (!profileSnap.exists) { console.log(`  skip ${doc.id} — profil negăsit`); continue; }

    const profile = profileSnap.data()!;

    // Găsește client_name dacă lipsește
    let clientName = data.client_name ?? "";
    let clientCnp = data.client_cnp ?? "";
    if (!clientName && data.client_id) {
      const clientSnap = await db.collection("clients").doc(data.client_id).get();
      if (clientSnap.exists) {
        const c = clientSnap.data()!;
        clientName = `${c.last_name} ${c.first_name}`;
        clientCnp = c.cnp ?? "";
      }
    }

    await doc.ref.update({
      agency_id: profile.agency_id,
      agent_name: data.agent_name ?? profile.full_name ?? "",
      client_name: clientName,
      client_cnp: clientCnp,
      status: data.status ?? "generat",
    });
    console.log(`  [+] ${doc.id} → agency: ${profile.agency_id}`);
    updated++;
  }

  console.log(`\nDone. ${updated} documente actualizate.`);
  process.exit(0);
}

migrate().catch((e) => { console.error(e.message); process.exit(1); });
