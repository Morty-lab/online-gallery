import { Outlet } from "react-router-dom";
import { ModeContext } from "../lib/mode";
import Header from "./Header.jsx";

/** Wraps a group of routes in one face of the site (public / preview / admin). */
const SiteLayout = ({ mode, base }) => (
  <ModeContext.Provider value={{ mode, base }}>
    <Header />
    <Outlet />
  </ModeContext.Provider>
);

export default SiteLayout;
