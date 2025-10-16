import { useState, useEffect } from 'react';
import { Calendar, FileText, Pill, CreditCard, User, Activity, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import * as appointmentService from '../../services/appointmentService';
import * as labService from '../../services/labService';
import * as prescriptionService from '../../services/prescriptionService';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch all dashboard data in parallel
        const appointmentsRes = await appointmentService.getMyAppointments();
        const prescriptionsRes = await prescriptionService.getPatientPrescriptions(user._id);
        
        // Lab results optional - may fail due to authorization
        let labResultsRes = null;
        try {
          labResultsRes = await labService.getPatientLabResults(user._id);
        } catch (labErr) {
          console.warn('Could not fetch lab results:', labErr);
        }

        if (appointmentsRes.success && appointmentsRes.data) {
          setAppointments(appointmentsRes.data);
        }
        
        if (labResultsRes && labResultsRes.success && labResultsRes.data) {
          setLabResults(labResultsRes.data.slice(0, 3)); // Show only recent 3
        }
        
        if (prescriptionsRes.success && prescriptionsRes.data) {
          // Filter active prescriptions
          const activePrescriptions = prescriptionsRes.data.filter(
            (rx: any) => rx.status === 'Pending' || rx.status === 'Active'
          );
          setPrescriptions(activePrescriptions);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const upcomingAppointments = appointments.filter(apt => apt.status === 'Scheduled');

  const quickActions = [
    { icon: Calendar, label: t('bookAppointment'), color: 'blue', action: () => navigate('appointments') },
    { icon: FileText, label: t('labResults'), color: 'green', action: () => navigate('lab-results') },
    { icon: Pill, label: t('prescriptions'), color: 'purple', action: () => navigate('prescriptions') },
    { icon: CreditCard, label: t('healthCard'), color: 'orange', action: () => navigate('health-card') },
    { icon: User, label: t('profile'), color: 'blue', action: () => navigate('profile') },
    { icon: Activity, label: 'Health Records', color: 'red', action: () => navigate('health-card') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="dashboard" isAuthenticated={true} userName={user?.name || 'User'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:ml-[280px]">
        <div className="mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('welcome')}, {user?.name.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Here's your health dashboard overview</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error Loading Dashboard</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-pink-500 to-pink-600',
              orange: 'from-orange-500 to-orange-600',
              red: 'from-red-500 to-red-600'
            }[action.color] || 'from-gray-500 to-gray-600';

            return (
              <button
                key={index}
                onClick={action.action}
                className={`liquid-glass rounded-2xl p-4 sm:p-6 transition-all hover:shadow-2xl text-left transform hover:-translate-y-2 group`}
              >
                <div className={`bg-gradient-to-br ${colorClasses} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{action.label}</h3>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                {t('upcomingAppointments')}
              </h2>
              <button
                onClick={() => navigate('appointments')}
                className="text-blue-600 hover:underline text-xs sm:text-sm font-semibold"
              >
                {t('viewAll')}
              </button>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map(apt => (
                  <div key={apt._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {apt.doctorId?.name || 'Doctor'}
                        </h3>
                        <p className="text-sm text-gray-600">{apt.department || 'General'}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(apt.date).toLocaleDateString()} at {apt.time}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Reason:</span> {apt.reason || 'Checkup'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming appointments</p>
                <button
                  onClick={() => navigate('appointments')}
                  className="mt-4 text-blue-600 hover:underline font-semibold"
                >
                  Book an appointment
                </button>
              </div>
            )}
          </div>

          <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
                {t('recentLabResults')}
              </h2>
              <button
                onClick={() => navigate('lab-results')}
                className="text-blue-600 hover:underline text-xs sm:text-sm font-semibold"
              >
                {t('viewAll')}
              </button>
            </div>

            {labResults.length > 0 ? (
              <div className="space-y-4">
                {labResults.map(lab => (
                  <div key={lab._id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lab.testType}</h3>
                        <p className="text-sm text-gray-600">
                          Ordered by {lab.doctorId?.name || 'Doctor'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lab.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        lab.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ordered: {new Date(lab.createdAt).toLocaleDateString()}
                    </p>
                    {lab.completedAt && (
                      <p className="text-sm text-gray-600">
                        Completed: {new Date(lab.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No lab results available</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-pink-600" />
                {t('activePrescriptions')}
              </h2>
              <button
                onClick={() => navigate('prescriptions')}
                className="text-blue-600 hover:underline text-xs sm:text-sm font-semibold"
              >
                {t('viewAll')}
              </button>
            </div>

            {prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.map(rx => (
                  <div key={rx._id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Prescribed by {rx.doctorId?.name || 'Doctor'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(rx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rx.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                        rx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        rx.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="space-y-2 mt-3">
                      {rx.medications.map((med: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <p className="font-semibold text-gray-900">{med.name} - {med.dosage}</p>
                          <p className="text-gray-600">
                            {med.frequency}
                            {med.duration && ` for ${med.duration}`}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Refills remaining: {rx.refillsRemaining}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No active prescriptions</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-2xl p-4 sm:p-6 text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {t('healthSummary')}
            </h2>
            <div className="space-y-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Blood Type</p>
                <p className="text-2xl font-bold">{user?.bloodType || 'N/A'}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Total Appointments</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Insurance Provider</p>
                <p className="text-lg font-semibold">{user?.insurance?.provider || 'Not provided'}</p>
              </div>
              <button
                onClick={() => navigate('health-card')}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Full Health Card
              </button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
