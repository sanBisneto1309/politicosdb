import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CandidatoPage from "./pages/CandidatoPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/candidato/:id" element={<CandidatoPage />} />
      </Route>
    </Routes>
  );
}
