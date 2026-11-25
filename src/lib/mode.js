import { createContext, useContext } from "react";

/**
 * Which face of the site is rendering:
 * - public:  the view-only site everyone sees at /
 * - preview: the same view-only site inside the dashboard (/dashboard/preview)
 * - admin:   the dashboard, with upload / cover / date / delete
 * `base` is the route prefix so links stay inside the current face.
 */
export const ModeContext = createContext({ mode: "public", base: "" });

export const useMode = () => {
  const { mode, base } = useContext(ModeContext);
  const to = (path) => (base + path).replace(/\/(?=\?|$)/, "") || "/";
  return { mode, base, to, canEdit: mode === "admin" };
};
