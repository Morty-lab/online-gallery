/* eslint-env node */
// One-time copy of the old Firebase gallery into Appwrite.
//
// Only works while Firebase Storage still serves the files. As of Nov 2026 the
// bucket answers 402 (Blaze plan required), so restore access first (e.g.
// switch the Firebase project to Blaze for the day), then run:
//
//   node --env-file=.env.local scripts/migrate-firebase-to-appwrite.mjs
//
// It runs unauthenticated: temporarily grant Any -> Create on the table and
// bucket while it runs, then remove it (APPWRITE_SETUP.md step 5).
//
// Safe to re-run: photos already copied (matched by Firestore id) are skipped.

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { Client, ID, Query, Storage, TablesDB } from "appwrite";

const env = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}. Run with --env-file=.env.local`);
  return value;
};

// Public Firebase web config of the old project (same values the app used).
const firebase = initializeApp({
  apiKey: env("FIREBASE_API_KEY"),
  authDomain: "online-gallery-c0a32.firebaseapp.com",
  projectId: "online-gallery-c0a32",
  storageBucket: "online-gallery-c0a32.appspot.com",
});
const firestore = getFirestore(firebase);

const client = new Client().setEndpoint(env("VITE_APPWRITE_ENDPOINT")).setProject(env("VITE_APPWRITE_PROJECT_ID"));
const tables = new TablesDB(client);
const storage = new Storage(client);
const databaseId = env("VITE_APPWRITE_DATABASE_ID");
const tableId = env("VITE_APPWRITE_TABLE_ID");
const bucketId = env("VITE_APPWRITE_BUCKET_ID");

const snapshot = await getDocs(collection(firestore, "photos"));
console.log(`Found ${snapshot.size} Firebase photos.`);

let copied = 0;
let skipped = 0;
const failed = [];

for (const doc of snapshot.docs) {
  const { photoURL, albumDate, dedicatedImage } = doc.data();
  // Firestore ids are 20 chars of [A-Za-z0-9], valid as Appwrite row ids.
  const rowId = doc.id;
  try {
    const existing = await tables.listRows({ databaseId, tableId, queries: [Query.equal("$id", rowId), Query.limit(1)] });
    if (existing.rows.length) {
      skipped++;
      continue;
    }

    const res = await fetch(photoURL);
    if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
    const type = res.headers.get("content-type") || "image/jpeg";
    const name = decodeURIComponent(new URL(photoURL).pathname.split("%2F").pop() || `${rowId}.jpg`);
    const file = new File([await res.arrayBuffer()], name, { type });

    const stored = await storage.createFile({ bucketId, fileId: ID.unique(), file });
    await tables.createRow({
      databaseId,
      tableId,
      rowId,
      data: { fileId: stored.$id, albumDate: albumDate.toDate().toISOString(), dedicatedImage: Boolean(dedicatedImage) },
    });
    copied++;
    console.log(`  copied ${rowId} (${copied + skipped}/${snapshot.size})`);
  } catch (err) {
    failed.push(rowId);
    console.error(`  FAILED ${rowId}: ${err.message}`);
  }
}

console.log(`\nDone. Copied ${copied}, already there ${skipped}, failed ${failed.length}.`);
if (failed.length) {
  console.log("Re-run the script to retry the failures.");
  process.exitCode = 1;
}
process.exit();
