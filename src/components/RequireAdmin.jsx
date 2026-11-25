import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

const Centered = ({ children }) => (
  <main className="grid min-h-screen place-items-center px-4 text-center">{children}</main>
);

/** Gate for everything under /dashboard. */
const RequireAdmin = () => {
  const { user, checking, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <Centered>
        <div className="skeleton h-10 w-48 rounded-full" aria-label="Checking your session" />
      </Centered>
    );
  }

  if (!user) return <Navigate to="/sign-in" replace state={{ from: location.pathname + location.search }} />;

  if (!isAdmin) {
    return (
      <Centered>
        <div className="max-w-sm">
          <h1 className="font-sign text-4xl font-black uppercase">No access</h1>
          <p className="mt-3 text-haze">
            {user.email} is signed in but isn&apos;t allowed to manage the gallery.
          </p>
          <button type="button" className="btn-ghost mt-8" onClick={signOut}>
            Sign out
          </button>
        </div>
      </Centered>
    );
  }

  return <Outlet />;
};

export default RequireAdmin;
