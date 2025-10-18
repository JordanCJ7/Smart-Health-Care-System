import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PatientDashboard from './PatientDashboard';

export default function PatientDashboardWrapper() {
  const { user } = useAuth();

  // Redirect non-authenticated users to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect staff members to staff dashboard
  if (user.role === 'Staff') {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // Redirect admin to admin dashboard
  if (user.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  // Show patient dashboard for patients
  return <PatientDashboard />;
}
