import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import LoginPage from './pages/LoginPage/LoginPage';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import AppointmentPage from './pages/AppointmentPage/AppointmentPage';
import LabResultsPage from './pages/LabResultsPage/LabResultsPage';
import PrescriptionPage from './pages/PrescriptionPage/PrescriptionPage';
import ProfileManagementPage from './pages/ProfileManagementPage/ProfileManagementPage';
import DigitalHealthCard from './pages/DigitalHealthCard/DigitalHealthCard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import DepartmentSchedule from './pages/Admin/DepartmentSchedule';
import Analytics from './pages/Admin/Analytics';
import Notifications from './pages/Admin/Notifications';
import DataSync from './pages/Admin/DataSync';
import PatientSupport from './pages/Admin/PatientSupport';
import PoliciesFaqs from './pages/Admin/PoliciesFaqs';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useNavigate as rrNavigate } from 'react-router-dom';
import { setRouterNavigate } from './pages/navigation';

function App() {
  // Router bridge component
  function RouterBridge() {
    const navigate = rrNavigate();
    useEffect(() => {
      setRouterNavigate((to: string) => navigate(to));
    }, [navigate]);
    return null;
  }
  return (
    <div className="min-h-screen">
      <Header />
      <RouterBridge />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/lab-results" element={<LabResultsPage />} />
          <Route path="/prescriptions" element={<PrescriptionPage />} />
          <Route path="/profile" element={<ProfileManagementPage />} />
          <Route path="/health-card" element={<DigitalHealthCard />} />

          {/* Admin protected routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="Admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute requiredRole="Admin"><DepartmentSchedule /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="Admin"><Analytics /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="Admin"><Notifications /></ProtectedRoute>} />
          <Route path="/admin/data-sync" element={<ProtectedRoute requiredRole="Admin"><DataSync /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute requiredRole="Admin"><PatientSupport /></ProtectedRoute>} />
          <Route path="/admin/policies" element={<ProtectedRoute requiredRole="Admin"><PoliciesFaqs /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
