import { ID, Query } from "appwrite";
import { appwriteConfig, storage, tables } from "../config/appwrite";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const pad2 = (n) => String(n).padStart(2, "0");

const { databaseId, tableId, bucketId } = appwriteConfig;

// Access is set on the table and bucket, not per row/file: Any can read,
// only users labelled "admin" can create, update and delete (APPWRITE_SETUP.md).

const fileURL = (fileId) => storage.getFileView({ bucketId, fileId });
const thumbURL = (fileId, width) =>
  appwriteConfig.previews ? storage.getFilePreview({ bucketId, fileId, width, quality: 80 }) : fileURL(fileId);

const toPhoto = (row) => ({
  id: row.$id,
  fileId: row.fileId,
  photoURL: fileURL(row.fileId),
  thumbURL: thumbURL(row.fileId, 640),
  dedicatedImage: Boolean(row.dedicatedImage),
  date: row.albumDate ? new Date(row.albumDate) : null,
});

/** Page through every matching row (Appwrite caps each page). */
async function listAll(queries) {
  const rows = [];
  let cursor = null;
  for (;;) {
    const page = await tables.listRows({
      databaseId,
      tableId,
      queries: [...queries, Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    rows.push(...page.rows);
    if (page.rows.length < 100) return rows;
    cursor = page.rows[page.rows.length - 1].$id;
  }
}

/** Every photo, oldest first. The archive is small and private, so one read is fine. */
export async function fetchAllPhotos() {
  const rows = await listAll([Query.orderAsc("albumDate")]);
  return rows.map(toPhoto).filter((p) => p.date);
}

/** Photos whose album date falls inside one calendar month (month is 1-12). */
export async function fetchMonthPhotos(month, year) {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 1).toISOString();
  const rows = await listAll([
    Query.greaterThanEqual("albumDate", start),
    Query.lessThan("albumDate", end),
    Query.orderAsc("albumDate"),
  ]);
  return rows.map(toPhoto);
}

/** Group photos into 12 month buckets for one year. Cover photo always goes first. */
export function buildYear(photos, year) {
  const months = MONTHS.map((name, index) => ({ name, index, number: index + 1, photos: [], cover: null }));
  for (const photo of photos) {
    if (photo.date.getFullYear() !== year) continue;
    const month = months[photo.date.getMonth()];
    month.photos.push(photo);
    if (photo.dedicatedImage) month.cover = photo;
  }
  for (const month of months) {
    month.cover ??= month.photos[0] ?? null;
    month.frames = month.cover
      ? [month.cover, ...month.photos.filter((p) => p.id !== month.cover.id)]
      : [];
  }
  return months;
}

/** Upload one image file and record it under the given album date. */
export async function uploadPhoto(file, date, onProgress) {
  const stored = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file,
    onProgress: (p) => onProgress?.(Math.min(p.progress / 100, 0.99)),
  });
  try {
    await tables.createRow({
      databaseId,
      tableId,
      rowId: ID.unique(),
      data: { fileId: stored.$id, albumDate: date.toISOString(), dedicatedImage: false },
    });
  } catch (err) {
    // Don't leave an orphaned file behind if the record failed.
    await storage.deleteFile({ bucketId, fileId: stored.$id }).catch(() => {});
    throw err;
  }
}

/** Make one photo the month's cover; clears any previous cover in the same month. */
export async function setMonthCover(photoId, monthPhotos) {
  const previous = monthPhotos.filter((p) => p.dedicatedImage && p.id !== photoId);
  await tables.updateRow({ databaseId, tableId, rowId: photoId, data: { dedicatedImage: true } });
  await Promise.all(
    previous.map((p) => tables.updateRow({ databaseId, tableId, rowId: p.id, data: { dedicatedImage: false } }))
  );
}

/** Move a photo to another day. Leaving its month also drops its cover status. */
export async function updatePhotoDate(photo, date) {
  const leavesMonth =
    date.getFullYear() !== photo.date.getFullYear() || date.getMonth() !== photo.date.getMonth();
  const data = { albumDate: date.toISOString(), ...(leavesMonth && photo.dedicatedImage ? { dedicatedImage: false } : {}) };
  await tables.updateRow({ databaseId, tableId, rowId: photo.id, data });
  return { ...photo, date, dedicatedImage: leavesMonth ? false : photo.dedicatedImage, leavesMonth };
}

/** Remove the record and its image file. */
export async function deletePhoto(photo) {
  await tables.deleteRow({ databaseId, tableId, rowId: photo.id });
  if (photo.fileId) await storage.deleteFile({ bucketId, fileId: photo.fileId }).catch(() => {});
}
