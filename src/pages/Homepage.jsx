import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BoothStrip, { BoothStripSkeleton } from "../components/BoothStrip.jsx";
import { buildYear, fetchAllPhotos, MONTHS } from "../lib/gallery";
import { useMode } from "../lib/mode";

const YearTabs = ({ years, active, onSelect }) => (
  <nav aria-label="Years" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
    <ul className="flex gap-1">
      {years.map((year) => {
        const current = year === active;
        return (
          <li key={year}>
            <button
              type="button"
              onClick={() => onSelect(year)}
              aria-current={current ? "true" : undefined}
              className={`relative rounded-full px-4 py-1.5 font-sign text-lg font-bold tabular-nums tracking-wide transition-colors duration-200 ${
                current ? "bg-paper text-ink" : "text-haze hover:bg-white/10 hover:text-paper"
              }`}
            >
              {current && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 right-1 h-2 w-2 rounded-full bg-lamp shadow-[0_0_10px_2px_rgb(255_68_51/0.6)]"
                />
              )}
              {year}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

const Homepage = () => {
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useSearchParams();
  const { canEdit } = useMode();

  useEffect(() => {
    let cancelled = false;
    fetchAllPhotos()
      .then((list) => !cancelled && setPhotos(list))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Couldn't load the gallery. Check your connection and refresh.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const years = useMemo(() => {
    if (!photos) return [];
    return [...new Set(photos.map((p) => p.date.getFullYear()))].sort((a, b) => b - a);
  }, [photos]);

  const requested = Number(params.get("year"));
  const year = years.includes(requested) ? requested : years[0];
  const months = useMemo(() => (photos && year ? buildYear(photos, year) : []), [photos, year]);
  const yearCount = months.reduce((sum, m) => sum + m.photos.length, 0);
  const activeMonths = months.filter((m) => m.photos.length).length;

  const selectYear = (y) => setParams(y === years[0] ? {} : { year: String(y) });
  const loading = !photos && !error;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <section className="flex flex-col gap-6 pb-10 pt-8 sm:pt-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {loading ? (
              <div className="skeleton h-24 w-64 rounded sm:h-36 sm:w-96" />
            ) : (
              <h1 className="font-sign text-[5.5rem] font-black leading-[0.82] tracking-[-0.01em] text-paper tabular-nums sm:text-[8rem]">
                {year ?? "Our year"}
              </h1>
            )}
            {!loading && year && (
              <p className="mt-4 text-haze">
                <span className="font-semibold text-paper">{yearCount}</span> photo{yearCount === 1 ? "" : "s"} across{" "}
                <span className="font-semibold text-paper">{activeMonths}</span> of 12 months
              </p>
            )}
          </div>
          {years.length > 1 && <YearTabs years={years} active={year} onSelect={selectYear} />}
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-lamp/15 px-4 py-3 text-paper ring-1 ring-inset ring-lamp/40">
            {error}
          </p>
        )}

        {!loading && !error && years.length === 0 && (
          <div className="mx-auto max-w-md py-20 text-center">
            <h2 className="font-sign text-4xl font-black uppercase">The booth is empty</h2>
            {canEdit ? (
              <>
                <p className="mt-3 text-haze">Add your first photos and they&apos;ll show up here, sorted by month.</p>
                <Link to="/dashboard/upload" className="btn-lamp mt-8 no-underline">
                  Add photos
                </Link>
              </>
            ) : (
              <p className="mt-3 text-haze">No photos yet. Check back soon.</p>
            )}
          </div>
        )}

        {(loading || months.length > 0) && (
          <ol className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 xl:grid-cols-6">
            {loading
              ? MONTHS.map((name, i) => (
                  <li key={name}>
                    <BoothStripSkeleton index={i} />
                  </li>
                ))
              : months.map((month) => (
                  <li key={month.name}>
                    <BoothStrip month={month} year={year} />
                  </li>
                ))}
          </ol>
        )}
      </main>
    </>
  );
};

export default Homepage;
