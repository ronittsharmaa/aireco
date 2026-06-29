import AirecoSite from "./pages/AirecoSite";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceDetails from "./pages/ServiceDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AirecoSite />} />
        <Route
          path="/services/:slug"
          element={<ServiceDetails title={"hello"} />}
        />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
