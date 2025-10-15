import { useState, useEffect } from 'react';
import { addNavigationListener } from './pages/navigation';
import HomePage from './pages/HomePage/HomePage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import LoginPage from './pages/LoginPage/LoginPage';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import AppointmentPage from './pages/AppointmentPage/AppointmentPage';
import LabResultsPage from './pages/LabResultsPage/LabResultsPage';
import PrescriptionPage from './pages/PrescriptionPage/PrescriptionPage';
import ProfileManagementPage from './pages/ProfileManagementPage/ProfileManagementPage';
import DigitalHealthCard from './pages/DigitalHealthCard/DigitalHealthCard';

type Page = 'home' | 'register' | 'login' | 'dashboard' | 'appointments' | 'lab-results' | 'prescriptions' | 'profile' | 'health-card';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const unsubscribe = addNavigationListener((page) => {
      setCurrentPage(page);
    });
    return unsubscribe;
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'register':
        return <RegistrationPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <PatientDashboard />;
      case 'appointments':
        return <AppointmentPage />;
      case 'lab-results':
        return <LabResultsPage />;
      case 'prescriptions':
        return <PrescriptionPage />;
      case 'profile':
        return <ProfileManagementPage />;
      case 'health-card':
        return <DigitalHealthCard />;
      default:
        return <HomePage />;
    }
  };

  return <div className="min-h-screen">{renderPage()}</div>;
}

export default App;
