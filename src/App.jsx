import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Albumpage from "./pages/Albumpage";
import ImageUploader from "./pages/ImageUpload";

function App() {
  return (
    <Routes>
      {/* Define other routes here */}
      <Route path="/" element={<Homepage/>} />
      <Route path="/album/:id" element={<Albumpage/>} />
      <Route path="/upload" element={<ImageUploader/>} />
    </Routes>
  );
}

export default App;
