import { Account, Client, Storage, TablesDB } from "appwrite";

// Public client identifiers (safe in the browser). Set them in .env.local
// locally and in Netlify's environment variables for production.
export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  tableId: import.meta.env.VITE_APPWRITE_TABLE_ID,
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  // Image previews (resized thumbnails) are an Appwrite image transformation.
  // Leave off unless your plan includes them; full images are used instead.
  previews: import.meta.env.VITE_APPWRITE_PREVIEWS === "true",
};

const missing = Object.entries(appwriteConfig)
  .filter(([key, value]) => key !== "previews" && !value)
  .map(([key]) => key);
if (missing.length) {
  console.error(`Appwrite is not configured. Missing: ${missing.join(", ")}. See APPWRITE_SETUP.md.`);
}

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint || "https://cloud.appwrite.io/v1")
  .setProject(appwriteConfig.projectId || "unset");

export const tables = new TablesDB(client);
export const storage = new Storage(client);
export const account = new Account(client);

// Confirms the connection once at startup (this module loads once). Dev only,
// so visitors never see it; a failure usually means a wrong endpoint/project
// ID or that this hostname isn't added as a Web platform in the console.
if (import.meta.env.DEV && !missing.length) {
  client
    .ping()
    .then(() => console.info(`Appwrite connected: project ${appwriteConfig.projectId}`))
    .catch((err) => console.error("Appwrite ping failed:", err.message));
}
