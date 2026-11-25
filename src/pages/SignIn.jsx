import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

const inputClass =
  "w-full rounded-lg border-0 bg-white/[0.07] px-4 py-3 text-paper ring-1 ring-inset ring-curtain-line placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-paper";

const messageFor = (err) => {
  if (err?.code === 401) return "That email and password don't match. Try again.";
  if (err?.code === 429) return "Too many tries. Wait a minute, then sign in again.";
  return "Couldn't reach the server. Check your connection and try again.";
};

const SignIn = () => {
  const { user, checking, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    document.title = "Sign in · AJ + CHA";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => {
      document.title = "AJ + CHA";
      robots.remove();
    };
  }, []);

  if (!checking && user && isAdmin) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(messageFor(err));
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mx-auto flex w-fit items-center gap-2.5 font-sign text-3xl font-extrabold uppercase leading-none tracking-wide text-paper no-underline"
        >
          <img src="/assets/logo.png" alt="" className="h-10 w-10 rounded-full object-cover" />
          AJ <span className="text-lamp">+</span> Cha
        </Link>

        <form onSubmit={submit} className="mt-10 rounded-[3px] bg-paper p-6 text-ink shadow-[0_24px_48px_-20px_rgb(0_0_0/0.8)] sm:p-8">
          <h1 className="font-sign text-4xl font-black uppercase leading-none">Sign in</h1>
          <p className="mt-2 text-sm text-ink-soft">To add, edit and remove photos.</p>

          <div className="mt-6 grid gap-4 [&_input]:bg-ink/[0.04] [&_input]:text-ink [&_input]:ring-ink/15 [&_input:focus]:ring-ink">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <p role="alert" className="mt-4 min-h-[1.25rem] text-sm font-medium text-[#c22a1c]">
            {error}
          </p>

          <button type="submit" disabled={busy} className="btn-lamp mt-2 w-full py-3 text-base">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="stamp mt-6 text-center text-ink-soft">
            {user && !isAdmin ? `${user.email} has no access` : "Members only"}
          </p>
        </form>
      </div>
    </main>
  );
};

export default SignIn;
