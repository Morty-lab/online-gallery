import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth.jsx";
import SiteLayout from "./components/SiteLayout.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
import Homepage from "./pages/Homepage";
import Albumpage from "./pages/Albumpage";
import ImageUploader from "./pages/ImageUpload";
import SignIn from "./pages/SignIn";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public, view-only site. Nothing here links to sign-in. */}
        <Route element={<SiteLayout mode="public" base="" />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/album/:id" element={<Albumpage />} />
        </Route>

        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/dashboard" element={<RequireAdmin />}>
          <Route element={<SiteLayout mode="admin" base="/dashboard" />}>
            <Route index element={<Homepage />} />
            <Route path="album/:id" element={<Albumpage />} />
            <Route path="upload" element={<ImageUploader />} />
          </Route>
          <Route path="preview" element={<SiteLayout mode="preview" base="/dashboard/preview" />}>
            <Route index element={<Homepage />} />
            <Route path="album/:id" element={<Albumpage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
