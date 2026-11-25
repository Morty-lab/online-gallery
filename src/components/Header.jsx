import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { useMode } from "../lib/mode";
import { EyeIcon, GridIcon, LogOutIcon, PlusIcon } from "./Icons.jsx";

const Wordmark = ({ to, compact }) => (
  <Link
    to={to}
    className="flex items-center gap-2.5 font-sign text-2xl font-extrabold uppercase leading-none tracking-wide text-paper no-underline"
  >
    <img src="/assets/logo.png" alt="" className={`h-8 w-8 rounded-full object-cover ${compact ? "hidden sm:block" : ""}`} />
    AJ <span className="text-lamp">+</span> Cha
  </Link>
);

const PreviewBar = () => (
  <div className="bg-lamp text-paper">
    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm sm:px-8">
      <EyeIcon className="h-4 w-4 shrink-0" />
      <p className="font-semibold">
        Preview <span className="hidden font-normal sm:inline">· this is exactly what visitors see</span>
      </p>
      <Link
        to="/dashboard"
        className="ml-auto rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink no-underline transition-colors hover:bg-paper-dim"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);

const navClass = ({ isActive }) =>
  `btn h-10 px-3 no-underline sm:px-4 ${isActive ? "bg-white/10 text-paper" : "text-haze hover:bg-white/10 hover:text-paper"}`;

const AdminNav = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <nav aria-label="Dashboard" className="ml-auto flex items-center gap-1 sm:gap-2">
      <NavLink to="/dashboard" end className={navClass} aria-label="Albums">
        <GridIcon className="h-4 w-4" />
        <span className="hidden md:inline">Albums</span>
      </NavLink>
      <NavLink to="/dashboard/preview" className={navClass} aria-label="Preview site">
        <EyeIcon className="h-4 w-4" />
        <span className="hidden md:inline">Preview</span>
      </NavLink>
      <button
        type="button"
        className={navClass({ isActive: false })}
        aria-label="Sign out"
        onClick={async () => {
          await signOut();
          navigate("/", { replace: true });
        }}
      >
        <LogOutIcon className="h-4 w-4" />
        <span className="hidden md:inline">Sign out</span>
      </button>
      <NavLink to="/dashboard/upload" className="btn-lamp ml-1 no-underline">
        <PlusIcon className="h-4 w-4" />
        <span>
          Add <span className="hidden sm:inline">photos</span>
        </span>
      </NavLink>
    </nav>
  );
};

const Header = () => {
  const { mode, to } = useMode();
  return (
    <header className="sticky top-0 z-30">
      {mode === "preview" && <PreviewBar />}
      <div className="border-b border-white/10 bg-curtain-deep/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-8">
          <Wordmark to={to("/")} compact={mode === "admin"} />
          {mode === "admin" && (
            <span className="stamp hidden rounded-full px-2 py-1 text-haze ring-1 ring-inset ring-curtain-line sm:inline">
              Dashboard
            </span>
          )}
          {mode === "admin" && <AdminNav />}
        </div>
      </div>
    </header>
  );
};

export default Header;
