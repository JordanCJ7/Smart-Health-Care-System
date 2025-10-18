import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import LoginPage from './pages/LoginPage/LoginPage';
import PatientDashboardWrapper from './pages/PatientDashboard/PatientDashboardWrapper';
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
import ProtectedRoute from './components/ProtectedRoute';
import StaffLayout from './pages/Staff/StaffLayout';
import StaffDashboard from './pages/Staff/StaffDashboard';
import TriageAdmission from './pages/Staff/TriageAdmission';
import DoctorDashboard from './pages/Staff/DoctorDashboard';
import LabTechnicianDashboard from './pages/Staff/LabTechnicianDashboard';
import PharmacyDashboard from './pages/Staff/PharmacyDashboard';
import EPrescription from './pages/Staff/EPrescription';
import MedicalHistory from './pages/Staff/MedicalHistory';
import Billing from './pages/Staff/Billing';
// Static Pages
import AboutUs from './pages/StaticPages/AboutUs';
import ContactUs from './pages/StaticPages/ContactUs';
import PrivacyPolicy from './pages/StaticPages/PrivacyPolicy';
import FAQ from './pages/StaticPages/FAQ';
import TermsOfService from './pages/StaticPages/TermsOfService';
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
          <Route path="/dashboard" element={<PatientDashboardWrapper />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/lab-results" element={<LabResultsPage />} />
          <Route path="/prescriptions" element={<PrescriptionPage />} />
          <Route path="/profile" element={<ProfileManagementPage />} />
          <Route path="/health-card" element={<DigitalHealthCard />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<TermsOfService />} />

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

          {/* Staff protected routes */}
          <Route path="/staff" element={<ProtectedRoute requiredRole="Staff"><StaffLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute requiredRole="Staff"><StaffDashboard /></ProtectedRoute>} />
            <Route path="triage" element={<ProtectedRoute requiredRole="Staff"><TriageAdmission /></ProtectedRoute>} />
            <Route path="doctor" element={<ProtectedRoute requiredRole="Staff"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="lab" element={<ProtectedRoute requiredRole="Staff"><LabTechnicianDashboard /></ProtectedRoute>} />
            <Route path="pharmacy" element={<ProtectedRoute requiredRole="Staff"><PharmacyDashboard /></ProtectedRoute>} />
            <Route path="e-prescription" element={<ProtectedRoute requiredRole="Staff"><EPrescription /></ProtectedRoute>} />
            <Route path="medical-history" element={<ProtectedRoute requiredRole="Staff"><MedicalHistory /></ProtectedRoute>} />
            <Route path="billing" element={<ProtectedRoute requiredRole="Staff"><Billing /></ProtectedRoute>} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
