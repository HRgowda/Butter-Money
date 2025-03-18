import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import { SignupPage } from "./pages/SignupPage";

export function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage></SignupPage>}></Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
