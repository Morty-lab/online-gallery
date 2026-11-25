import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, CloseIcon, ImagesIcon } from "../components/Icons.jsx";
import { MONTHS, uploadPhoto } from "../lib/gallery";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// "2026-03-14" -> local midnight, not UTC (avoids landing in the previous month).
const parseDay = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

let nextId = 0;
const toItem = (file) => ({
  id: ++nextId,
  file,
  preview: URL.createObjectURL(file),
  progress: 0,
  state: "ready", // ready | uploading | done | error
});

const ImageUploader = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [day, setDay] = useState(params.get("date") || todayISO());
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const skipped = fileList.length - files.length;
    setError(skipped ? `${skipped} file${skipped === 1 ? " isn't an image" : "s aren't images"} and ${skipped === 1 ? "was" : "were"} skipped.` : null);
    if (files.length) setItems((list) => [...list, ...files.map(toItem)]);
  };

  // Paste a screenshot or copied photo straight in.
  useEffect(() => {
    const onPaste = (e) => {
      if (uploading || !e.clipboardData?.files?.length) return;
      addFiles(e.clipboardData.files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const removeItem = (id) =>
    setItems((list) => {
      const gone = list.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return list.filter((i) => i.id !== id);
    });

  const patch = (id, changes) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...changes } : i)));

  const pending = items.filter((i) => i.state !== "done");
  const date = day ? parseDay(day) : null;
  const albumLabel = date ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` : null;

  const handleUpload = async () => {
    if (!date) return setError("Pick the date these photos were taken.");
    if (!pending.length) return setError("Add at least one photo first.");
    setError(null);
    setUploading(true);

    const results = await Promise.allSettled(
      pending.map(async (item) => {
        patch(item.id, { state: "uploading", progress: 0 });
        try {
          await uploadPhoto(item.file, date, (progress) => patch(item.id, { progress }));
          patch(item.id, { state: "done", progress: 1 });
        } catch (err) {
          console.error(err);
          patch(item.id, { state: "error" });
          throw err;
        }
      })
    );
    setUploading(false);

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) {
      setError(`${failed} photo${failed === 1 ? "" : "s"} didn't upload. Check your connection, then try again — finished ones won't upload twice.`);
      return;
    }
    navigate(`/dashboard/album/${date.getMonth() + 1}_${date.getFullYear()}`);
  };

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-8">
        <section className="pb-8 pt-6 sm:pt-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-haze no-underline transition-colors hover:text-paper"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Albums
          </Link>
          <h1 className="mt-4 font-sign text-6xl font-black uppercase leading-[0.85] sm:text-8xl">Into the booth</h1>
          <p className="mt-4 max-w-prose text-haze">
            Pick the day, drop in the photos. They&apos;ll file themselves under that month.
          </p>
        </section>

        <div className="grid gap-6">
          <label className="grid gap-2 sm:max-w-xs">
            <span className="text-sm font-semibold">Taken on</span>
            <input
              type="date"
              value={day}
              max={todayISO()}
              onChange={(e) => setDay(e.target.value)}
              disabled={uploading}
              className="rounded-lg border-0 bg-white/[0.07] px-4 py-3 font-stamp text-sm text-paper ring-1 ring-inset ring-curtain-line [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-paper"
            />
            {albumLabel && <span className="text-sm text-haze">Goes into {albumLabel}</span>}
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!uploading) addFiles(e.dataTransfer.files);
            }}
            className={`relative grid place-items-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ${
              dragging ? "border-lamp bg-lamp/10" : "border-curtain-line bg-white/[0.03]"
            }`}
          >
            <ImagesIcon className="h-10 w-10 text-haze" />
            <p className="mt-4 font-sign text-2xl font-bold uppercase tracking-wide">
              {dragging ? "Let go to add" : "Drop photos here"}
            </p>
            <p className="mt-1 text-sm text-haze">or paste them, or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-ghost mt-4"
            >
              Choose from device
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {items.length > 0 && (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => (
                <li key={item.id} className="relative bg-paper p-1">
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className={`aspect-square w-full object-cover transition-opacity ${
                      item.state === "uploading" ? "opacity-60" : ""
                    }`}
                  />
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                    <div
                      className={`h-full transition-[width] duration-200 ${
                        item.state === "error" ? "bg-lamp" : item.state === "done" ? "bg-ink" : "bg-lamp"
                      }`}
                      style={{ width: `${Math.round((item.state === "error" ? 1 : item.progress) * 100)}%` }}
                    />
                  </div>
                  <span className="sr-only">
                    {item.state === "done" ? "Uploaded" : item.state === "error" ? "Failed" : item.state === "uploading" ? `${Math.round(item.progress * 100)}%` : "Ready"}
                  </span>
                  {!uploading && item.state !== "done" && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                      className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-paper shadow-md transition-colors hover:bg-lamp"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p role="alert" className={`min-h-[1.5rem] text-sm ${error ? "text-lamp-hot" : ""}`}>
            {error}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={handleUpload} disabled={uploading || !pending.length} className="btn-lamp px-8 py-3 text-base">
              {uploading
                ? "Uploading…"
                : pending.length
                ? `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`
                : "Upload photos"}
            </button>
            {items.length > 0 && !uploading && (
              <button
                type="button"
                onClick={() => {
                  items.forEach((i) => URL.revokeObjectURL(i.preview));
                  setItems([]);
                  setError(null);
                }}
                className="text-sm font-semibold text-haze underline hover:text-paper"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ImageUploader;
