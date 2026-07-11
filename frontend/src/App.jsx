import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import PageTransition from "./components/PageTransition.jsx";
import AnalyzePage from "./pages/AnalyzePage.jsx";
import DeploymentPage from "./pages/DeploymentPage.jsx";
import EncyclopediaPage from "./pages/EncyclopediaPage.jsx";
import GuidePage from "./pages/GuidePage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import QAPage from "./pages/QAPage.jsx";
import FloraVoicePage from "./pages/FloraVoicePage.jsx";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/qa" element={<PageTransition><QAPage /></PageTransition>} />
        <Route path="/voice" element={<PageTransition><FloraVoicePage /></PageTransition>} />
        <Route element={<Layout />}>
          <Route path="/analyze" element={<PageTransition><AnalyzePage /></PageTransition>} />
          <Route path="/encyclopedia" element={<PageTransition><EncyclopediaPage /></PageTransition>} />
          <Route path="/history" element={
            <ProtectedRoute>
              <PageTransition><HistoryPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/guide" element={<PageTransition><GuidePage /></PageTransition>} />
          <Route path="/deployment" element={<PageTransition><DeploymentPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  );
}
