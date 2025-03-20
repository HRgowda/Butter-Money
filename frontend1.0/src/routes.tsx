import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/Dashboard';
import { ProtectedRoute } from './components/Protected';
import { AuthProvider } from './context/AuthContext';
import { SignupPage } from './pages/SignupPage';
import DocumentViewer from './components/DocumentViewer';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Navigate to={'/login'} />}></Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents/:id" element={<DocumentViewer />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
