import { readFileSync } from "fs";
import { resolve } from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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

const TEST_EMAIL = "test@evand.ro";
const TEST_PASS  = "Test1234!";

async function run() {
  const auth = getAuth(app);
  try {
    const existing = await auth.getUserByEmail(TEST_EMAIL);
    await auth.updateUser(existing.uid, { password: TEST_PASS });
    console.log("updated uid=" + existing.uid);
  } catch {
    const created = await auth.createUser({ email: TEST_EMAIL, password: TEST_PASS });
    console.log("created uid=" + created.uid);
  }
  console.log("email=" + TEST_EMAIL + " pass=" + TEST_PASS);
}

run().catch(e => { console.error(e.message); process.exit(1); });
