import { useEffect, useRef, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, StarIcon, TrashIcon } from "./Icons.jsx";

const formatDay = (date) =>
  date?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

const toISODay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// "2026-03-14" -> local midnight, not UTC.
const parseDay = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Full-size viewer. Opening it, and every step to another photo, fires the
 * booth flash: a white field that drops away as the frame appears.
 */
const Lightbox = ({ photos, index, onIndex, onClose, readOnly = false, onMakeCover, onChangeDate, onDelete }) => {
  const dialogRef = useRef(null);
  const [confirming, setConfirming] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [newDay, setNewDay] = useState("");
  const [busy, setBusy] = useState(null);
  const [status, setStatus] = useState(null);
  const photo = photos[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    setConfirming(false);
    setEditingDate(false);
    setStatus(null);
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" && index < photos.length - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onIndex]);

  if (!photo) return null;

  const run = async (kind, action, done) => {
    setBusy(kind);
    setStatus(null);
    try {
      await action();
      setStatus({ tone: "ok", text: done });
      return true;
    } catch (err) {
      console.error(err);
      setStatus({ tone: "error", text: "That didn't go through. Check your connection and try again." });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = () => {
    if (!confirming) return setConfirming(true);
    run("delete", () => onDelete(photo), "Photo deleted.");
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 text-paper backdrop:bg-curtain-deep/95 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <p className="stamp text-haze">
            <span className="text-paper">{String(index + 1).padStart(2, "0")}</span> / {String(photos.length).padStart(2, "0")}
          </p>
          <p className="hidden text-sm text-haze sm:block">{formatDay(photo.date)}</p>
          <button type="button" onClick={onClose} className="btn-ghost ml-auto h-10 w-10 p-0" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
          <img
            key={photo.id}
            src={photo.photoURL}
            alt={`Photo ${index + 1} of ${photos.length}`}
            className="max-h-full max-w-full rounded-[2px] bg-paper object-contain p-1.5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] sm:p-2.5"
          />
          <span key={`flash-${photo.id}`} aria-hidden="true" className="pointer-events-none fixed inset-0 bg-white animate-flash" />
          {index > 0 && (
            <button
              type="button"
              onClick={() => onIndex(index - 1)}
              aria-label="Previous photo"
              className="btn-ghost absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 bg-curtain-deep/60 p-0 sm:left-4"
            >
              <ChevronLeftIcon />
            </button>
          )}
          {index < photos.length - 1 && (
            <button
              type="button"
              onClick={() => onIndex(index + 1)}
              aria-label="Next photo"
              className="btn-ghost absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 bg-curtain-deep/60 p-0 sm:right-4"
            >
              <ChevronRightIcon />
            </button>
          )}
        </div>

        {readOnly ? (
          <p className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-center text-sm text-haze sm:hidden">
            {formatDay(photo.date)}
          </p>
        ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {editingDate ? (
            <form
              className="flex basis-full flex-wrap items-center justify-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDay) return;
                run("date", () => onChangeDate(photo, parseDay(newDay)), "Date updated.").then((ok) => ok && setEditingDate(false));
              }}
            >
              <label className="sr-only" htmlFor="photo-date">New date</label>
              <input
                id="photo-date"
                type="date"
                required
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="rounded-full border-0 bg-white/[0.07] px-4 py-2.5 font-stamp text-sm text-paper ring-1 ring-inset ring-curtain-line [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-paper"
              />
              <button type="submit" className="btn-lamp" disabled={busy !== null}>
                {busy === "date" ? "Saving…" : "Save date"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setEditingDate(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              disabled={busy !== null}
              onClick={() => {
                setNewDay(toISODay(photo.date));
                setEditingDate(true);
              }}
            >
              <CalendarIcon className="h-4 w-4" />
              Change date
            </button>
          )}
          {editingDate ? null : photo.dedicatedImage ? (
            <span className="btn cursor-default bg-paper text-ink">
              <StarIcon className="h-4 w-4 fill-lamp stroke-lamp" />
              Month cover
            </span>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              disabled={busy !== null}
              onClick={() => run("cover", () => onMakeCover(photo.id), "This is now the month's cover.")}
            >
              <StarIcon className="h-4 w-4" />
              {busy === "cover" ? "Saving…" : "Make month cover"}
            </button>
          )}
          {!editingDate && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            className={confirming ? "btn-lamp" : "btn-ghost"}
          >
            <TrashIcon className="h-4 w-4" />
            {busy === "delete" ? "Deleting…" : confirming ? "Tap again to delete" : "Delete"}
          </button>
          )}
          <p
            role="status"
            className={`basis-full text-center text-sm ${status?.tone === "error" ? "text-lamp-hot" : "text-haze"}`}
          >
            {status?.text ?? " "}
          </p>
        </div>
        )}
      </div>
    </dialog>
  );
};

export default Lightbox;
