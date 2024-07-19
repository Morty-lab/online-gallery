import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Albumpage from "./pages/Albumpage";

function App() {
  return (
    <Routes>
      {/* Define other routes here */}
      <Route path="/" element={<Homepage/>} />
      <Route path="/album/:id" element={<Albumpage/>} />
    </Routes>
  );
}

export default App;
