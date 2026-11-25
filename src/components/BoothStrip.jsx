import { Link } from "react-router-dom";
import { pad2 } from "../lib/gallery";
import { useMode } from "../lib/mode";

// Booth strips land a little askew on the table; deterministic per month.
const TILT = [-1.4, 0.9, -0.6, 1.3, -1.1, 0.5, 1.2, -0.8, 0.7, -1.3, 1, -0.5];

const FRAMES = 4;

const Frame = ({ photo, month, slot }) => (
  <div
    className={`relative aspect-[4/3] overflow-hidden ${
      month.photos.length ? "bg-ink" : "bg-white/[0.025] ring-1 ring-inset ring-white/[0.06]"
    } ${slot === FRAMES - 1 ? "hidden sm:block" : ""}`}
  >
    {photo ? (
      <img
        src={photo.thumbURL}
        alt={`${month.name}, photo ${slot + 1}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover animate-develop"
        style={{ animationDelay: `${slot * 90}ms` }}
      />
    ) : (
      slot === 0 &&
      month.photos.length === 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center font-sign text-4xl font-black text-white/[0.12]"
        >
          {pad2(month.number)}
        </span>
      )
    )}
  </div>
);

const BoothStrip = ({ month, year }) => {
  const { to } = useMode();
  const count = month.photos.length;
  const empty = count === 0;
  const tilt = TILT[month.index];

  return (
    <Link
      to={to(`/album/${month.number}_${year}`)}
      aria-label={`${month.name} ${year}, ${empty ? "no photos yet" : `${count} photo${count === 1 ? "" : "s"}`}`}
      className="group block no-underline outline-none"
      style={{ "--tilt": `${tilt}deg` }}
    >
      <div
        className={`rotate-[var(--tilt)] rounded-[3px] p-2 pb-0 shadow-[0_18px_30px_-14px_rgb(0_0_0/0.7)] transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:shadow-[0_28px_40px_-16px_rgb(0_0_0/0.8)] group-focus-visible:rotate-0 group-focus-visible:ring-2 group-focus-visible:ring-paper group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-curtain-deep ${
          empty ? "bg-paper/[0.08] ring-1 ring-inset ring-white/10" : "bg-paper"
        }`}
      >
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: FRAMES }, (_, slot) => (
            <Frame key={slot} photo={month.frames[slot]} month={month} slot={slot} />
          ))}
        </div>
        <div
          className={`flex items-baseline justify-between gap-1 whitespace-nowrap px-0.5 py-2.5 stamp ${
            empty ? "text-haze/80" : "text-ink-soft"
          }`}
        >
          <span>
            <span className={empty ? "" : "text-ink"}>{pad2(month.number)}</span>.{year}
          </span>
          <span>{empty ? "—" : `${count} pic${count === 1 ? "" : "s"}`}</span>
        </div>
      </div>
      <p
        className={`mt-3 text-center font-sign text-xl font-bold uppercase tracking-wide transition-colors duration-200 ${
          empty ? "text-haze/70" : "text-paper group-hover:text-lamp-hot"
        }`}
      >
        {month.name}
      </p>
    </Link>
  );
};

export const BoothStripSkeleton = ({ index }) => (
  <div aria-hidden="true" style={{ "--tilt": `${TILT[index]}deg` }}>
    <div className="rotate-[var(--tilt)] rounded-[3px] bg-paper/[0.06] p-2 pb-0">
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: FRAMES }, (_, slot) => (
          <div key={slot} className={`skeleton aspect-[4/3] ${slot === FRAMES - 1 ? "hidden sm:block" : ""}`} />
        ))}
      </div>
      <div className="py-2.5">
        <div className="skeleton h-2.5 w-2/3 rounded-sm" />
      </div>
    </div>
    <div className="skeleton mx-auto mt-3 h-4 w-1/2 rounded-sm" />
  </div>
);

export default BoothStrip;
