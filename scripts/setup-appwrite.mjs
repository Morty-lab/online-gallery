/* eslint-env node */
// Creates everything the gallery needs in an Appwrite project:
// database, photos table (columns + index), photos bucket, permissions, and
// the admin-labelled user accounts. Safe to re-run: existing pieces are
// updated to match, never duplicated or wiped.
//
//   node --env-file=.env.local scripts/setup-appwrite.mjs
//
// Needs in .env.local: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID,
// APPWRITE_API_KEY (temporary; delete it in the console afterwards), and
// optionally ADMIN_1_EMAIL / ADMIN_1_PASSWORD / ADMIN_1_NAME (and ADMIN_2_*).

import {
  Client,
  Compression,
  ID,
  OrderBy,
  Permission,
  Query,
  Role,
  Storage,
  TablesDB,
  TablesDBIndexType,
  Users,
} from "node-appwrite";

const env = (key, fallback) => {
  const value = process.env[key] || fallback;
  if (!value) {
    console.error(`Missing ${key} in .env.local`);
    process.exit(1);
  }
  return value;
};

const client = new Client()
  .setEndpoint(env("VITE_APPWRITE_ENDPOINT"))
  .setProject(env("VITE_APPWRITE_PROJECT_ID"))
  .setKey(env("APPWRITE_API_KEY"));
const tables = new TablesDB(client);
const storage = new Storage(client);
const users = new Users(client);

const databaseId = env("VITE_APPWRITE_DATABASE_ID", "gallery");
const tableId = env("VITE_APPWRITE_TABLE_ID", "photos");
const bucketId = env("VITE_APPWRITE_BUCKET_ID", "photos");
const ADMIN = "admin";

// Visitors read; only users labelled "admin" write. Must match src/lib/auth-context.js.
const permissions = [
  Permission.read(Role.any()),
  Permission.create(Role.label(ADMIN)),
  Permission.read(Role.label(ADMIN)),
  Permission.update(Role.label(ADMIN)),
  Permission.delete(Role.label(ADMIN)),
];

const notFound = (err) => err?.code === 404;
const step = (msg) => console.log(`\n• ${msg}`);
const ok = (msg) => console.log(`  ✓ ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureDatabase() {
  step(`Database "${databaseId}"`);
  try {
    await tables.get({ databaseId });
    ok("already exists");
  } catch (err) {
    if (!notFound(err)) throw err;
    await tables.create({ databaseId, name: "Gallery" });
    ok("created");
  }
}

async function ensureTable() {
  step(`Table "${tableId}"`);
  try {
    await tables.getTable({ databaseId, tableId });
    await tables.updateTable({ databaseId, tableId, name: "Photos", permissions, rowSecurity: false });
    ok("already exists, permissions updated");
  } catch (err) {
    if (!notFound(err)) throw err;
    await tables.createTable({ databaseId, tableId, name: "Photos", permissions, rowSecurity: false });
    ok("created");
  }
}

async function ensureColumns() {
  step("Columns");
  const { columns } = await tables.listColumns({ databaseId, tableId });
  const have = new Set(columns.map((c) => c.key));
  const base = { databaseId, tableId };

  if (!have.has("fileId")) {
    try {
      await tables.createVarcharColumn({ ...base, key: "fileId", size: 36, required: true });
    } catch (err) {
      // Older servers only know the string column type.
      if (!notFound(err)) throw err;
      await tables.createStringColumn({ ...base, key: "fileId", size: 36, required: true });
    }
    ok("fileId created");
  } else ok("fileId exists");

  if (!have.has("albumDate")) {
    await tables.createDatetimeColumn({ ...base, key: "albumDate", required: true });
    ok("albumDate created");
  } else ok("albumDate exists");

  if (!have.has("dedicatedImage")) {
    await tables.createBooleanColumn({ ...base, key: "dedicatedImage", required: false, xdefault: false });
    ok("dedicatedImage created");
  } else ok("dedicatedImage exists");

  // Columns build in the background; the index needs them ready.
  for (let i = 0; i < 30; i++) {
    const { columns: now } = await tables.listColumns({ databaseId, tableId });
    const pending = now.filter((c) => c.status !== "available");
    const failed = now.filter((c) => c.status === "failed");
    if (failed.length) throw new Error(`Column(s) failed to build: ${failed.map((c) => c.key).join(", ")}`);
    if (!pending.length) return ok("all columns ready");
    await sleep(1000);
  }
  throw new Error("Columns are still processing after 30s. Re-run the script in a minute.");
}

async function ensureIndex() {
  step("Index on albumDate");
  const { indexes } = await tables.listIndexes({ databaseId, tableId });
  if (indexes.some((i) => i.key === "albumDate_asc")) return ok("already exists");
  await tables.createIndex({
    databaseId,
    tableId,
    key: "albumDate_asc",
    type: TablesDBIndexType.Key,
    columns: ["albumDate"],
    orders: [OrderBy.Asc],
  });
  ok("created");
}

async function ensureBucket() {
  step(`Bucket "${bucketId}"`);
  const settings = {
    bucketId,
    name: "Photos",
    permissions,
    fileSecurity: false,
    enabled: true,
    maximumFileSize: 30 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
    compression: Compression.None,
    encryption: false,
    antivirus: true,
  };
  try {
    await storage.getBucket({ bucketId });
    await storage.updateBucket(settings);
    ok("already exists, settings updated");
  } catch (err) {
    if (!notFound(err)) throw err;
    await storage.createBucket(settings);
    ok("created");
  }
}

async function ensureAdmins() {
  step("Admin accounts");
  const admins = [1, 2, 3]
    .map((n) => ({
      email: process.env[`ADMIN_${n}_EMAIL`],
      password: process.env[`ADMIN_${n}_PASSWORD`],
      name: process.env[`ADMIN_${n}_NAME`],
    }))
    .filter((a) => a.email);

  if (!admins.length) {
    console.log("  – none in .env.local (ADMIN_1_EMAIL…). Create users in the console and give them the 'admin' label.");
    return;
  }

  for (const admin of admins) {
    const { users: found } = await users.list({ queries: [Query.equal("email", admin.email)] });
    let user = found[0];
    if (!user) {
      if (!admin.password || admin.password.length < 8) {
        console.log(`  ! ${admin.email}: needs a password of 8+ characters (ADMIN_n_PASSWORD). Skipped.`);
        continue;
      }
      user = await users.create({ userId: ID.unique(), email: admin.email, password: admin.password, name: admin.name });
      ok(`${admin.email} created`);
    } else ok(`${admin.email} already exists`);

    if (!user.labels?.includes(ADMIN)) {
      await users.updateLabels({ userId: user.$id, labels: [...(user.labels || []), ADMIN] });
      ok(`${admin.email} labelled admin`);
    }
  }
}

try {
  console.log(`Setting up Appwrite project ${process.env.VITE_APPWRITE_PROJECT_ID} at ${process.env.VITE_APPWRITE_ENDPOINT}`);
  await ensureDatabase();
  await ensureTable();
  await ensureColumns();
  await ensureIndex();
  await ensureBucket();
  await ensureAdmins();
  console.log(`
Done. Still to do by hand in the console:
  1. Auth → Settings: set Users limit to the number of admins (blocks other sign-ups).
  2. Overview → Integrations → API keys: delete the key used for this script,
     and remove APPWRITE_API_KEY (and the ADMIN_*_PASSWORD lines) from .env.local.
  3. Restart the dev server so it picks up the new env values.`);
} catch (err) {
  console.error(`\n✗ Setup stopped: ${err.message}`);
  if (err.code === 401) console.error("  The API key is wrong or is missing scopes (databases, tables, storage, users).");
  if (err.type === "project_not_found") console.error("  Check VITE_APPWRITE_PROJECT_ID and VITE_APPWRITE_ENDPOINT.");
  process.exitCode = 1;
}
