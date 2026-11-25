import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Lightbox from "../components/Lightbox.jsx";
import { ArrowLeftIcon, StarIcon } from "../components/Icons.jsx";
import { deletePhoto, fetchMonthPhotos, MONTHS, pad2, setMonthCover, updatePhotoDate } from "../lib/gallery";
import { useMode } from "../lib/mode";

const Albumpage = () => {
  const { id } = useParams();
  const [month, year] = id.split("_").map(Number);
  const monthName = MONTHS[month - 1];
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const { to, canEdit } = useMode();

  useEffect(() => {
    let cancelled = false;
    setPhotos(null);
    fetchMonthPhotos(month, year)
      .then((list) => !cancelled && setPhotos(list))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Couldn't load this month. Check your connection and refresh.");
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const makeCover = useCallback(
    async (photoId) => {
      await setMonthCover(photoId, photos);
      setPhotos((list) => list.map((p) => ({ ...p, dedicatedImage: p.id === photoId })));
    },
    [photos]
  );

  const remove = useCallback(
    async (photo) => {
      await deletePhoto(photo);
      const next = photos.filter((p) => p.id !== photo.id);
      setPhotos(next);
      setOpen((i) => (next.length === 0 ? null : Math.min(i, next.length - 1)));
    },
    [photos]
  );

  const changeDate = useCallback(
    async (photo, date) => {
      const updated = await updatePhotoDate(photo, date);
      const next = updated.leavesMonth
        ? photos.filter((p) => p.id !== photo.id)
        : photos.map((p) => (p.id === photo.id ? updated : p)).sort((a, b) => a.date - b.date);
      setPhotos(next);
      if (updated.leavesMonth) setOpen((i) => (next.length === 0 ? null : Math.min(i, next.length - 1)));
    },
    [photos]
  );

  if (!monthName || !year) {
    return (
      <>
        <main className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-sign text-5xl font-black uppercase">No such month</h1>
          <Link to={to("/")} className="btn-ghost mt-8 no-underline">
            Back to the gallery
          </Link>
        </main>
      </>
    );
  }

  const loading = !photos && !error;
  const count = photos?.length ?? 0;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <section className="pb-8 pt-6 sm:pb-12 sm:pt-10">
          <Link
            to={to(`/?year=${year}`)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-haze no-underline transition-colors hover:text-paper"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            All of {year}
          </Link>
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <h1 className="font-sign text-6xl font-black uppercase leading-[0.85] sm:text-8xl">{monthName}</h1>
            <p className="stamp pb-2 text-sm text-haze">
              {pad2(month)} · {year} {loading ? "" : `· ${count} photo${count === 1 ? "" : "s"}`}
            </p>
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-lamp/15 px-4 py-3 ring-1 ring-inset ring-lamp/40">
            {error}
          </p>
        )}

        {loading && (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4" aria-hidden="true">
            {[4 / 3, 3 / 4, 1, 4 / 3, 3 / 4, 4 / 3, 1, 3 / 4].map((ratio, i) => (
              <div key={i} className="mb-4 break-inside-avoid bg-paper/[0.06] p-1.5">
                <div className="skeleton w-full" style={{ aspectRatio: ratio }} />
              </div>
            ))}
          </div>
        )}

        {photos && count === 0 && (
          <div className="mx-auto max-w-md py-16 text-center">
            <h2 className="font-sign text-4xl font-black uppercase">Nothing from {monthName} yet</h2>
            {canEdit ? (
              <>
                <p className="mt-3 text-haze">Photos dated in {monthName} {year} will land here.</p>
                <Link to={`/dashboard/upload?date=${year}-${pad2(month)}-01`} className="btn-lamp mt-8 no-underline">
                  Add photos to {monthName}
                </Link>
              </>
            ) : (
              <p className="mt-3 text-haze">No photos from this month.</p>
            )}
          </div>
        )}

        {photos && count > 0 && (
          <ul className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
            {photos.map((photo, i) => (
              <li key={photo.id} className="mb-3 break-inside-avoid sm:mb-4">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative block w-full bg-paper p-1.5 text-left shadow-[0_14px_24px_-14px_rgb(0_0_0/0.7)] transition-transform duration-300 ease-out hover:-translate-y-1"
                  aria-label={`Open photo ${i + 1}${canEdit && photo.dedicatedImage ? ", month cover" : ""}`}
                >
                  <img
                    src={photo.thumbURL}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="block w-full animate-develop"
                  />
                  <span className="flex items-center justify-between px-0.5 pt-1.5 stamp text-ink-soft">
                    <span>
                      {photo.date?.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                    </span>
                    {canEdit && photo.dedicatedImage && (
                      <span className="inline-flex items-center gap-1 text-ink">
                        <StarIcon className="h-3 w-3 fill-lamp stroke-lamp" /> Cover
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {open !== null && photos?.[open] && (
        <Lightbox
          photos={photos}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          readOnly={!canEdit}
          onMakeCover={makeCover}
          onChangeDate={changeDate}
          onDelete={remove}
        />
      )}
    </>
  );
};

export default Albumpage;
