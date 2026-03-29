import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { LandingPage } from "@/pages/LandingPage";
import { AnalysisPage } from "@/pages/AnalysisPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/results/:id" element={<AnalysisPage />} />
      </Routes>
    </BrowserRouter>
  );
}
