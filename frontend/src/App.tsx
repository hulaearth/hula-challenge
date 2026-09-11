import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import OverviewPage from "./pages/OverviewPage";
import SpeciesPage from "./pages/SpeciesPage";
import TaxonPage from "./pages/TaxonPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route
            path="/"
            element={<OverviewPage />}
          />

          <Route
            path="/taxa/:taxon"
            element={<TaxonPage />}
          />

          <Route
            path="/species/:speciesId"
            element={<SpeciesPage />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}