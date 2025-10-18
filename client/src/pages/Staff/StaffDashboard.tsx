import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { 
  Calendar, FileText, Pill, CreditCard, User, Activity, 
  Clock, AlertCircle, Loader2, Stethoscope, Users, Heart 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as appointmentService from '../../services/appointmentService';
import * as labService from '../../services/labService';
import * as prescriptionService from '../../services/prescriptionService';

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'appointments' | 'prescriptions' | 'labs'>('overview');

  useEffect(() => {
    const fetchStaffDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch all data for staff
        const [appointmentsRes, prescriptionsRes, labsRes] = await Promise.allSettled([
          appointmentService.getMyAppointments(),
          prescriptionService.getAllPrescriptions?.() || Promise.reject('Not available'),
          labService.getAllLabOrders?.() || Promise.reject('Not available'),
        ]);

        // Handle appointments
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.success) {
          setAppointments(appointmentsRes.value.data);
          
          // Extract unique patients from appointments
          const uniquePatients = appointmentsRes.value.data
            .filter((apt: any) => apt.patientId)
            .reduce((acc: any[], apt: any) => {
              const exists = acc.find(p => p._id === apt.patientId._id);
              if (!exists && apt.patientId._id) {
                acc.push(apt.patientId);
              }
              return acc;
            }, []);
          setPatients(uniquePatients);
        }
        
        // Handle prescriptions
        if (prescriptionsRes.status === 'fulfilled' && prescriptionsRes.value.success) {
          setPrescriptions(prescriptionsRes.value.data);
        }
        
        // Handle lab results
        if (labsRes.status === 'fulfilled' && labsRes.value.success) {
          setLabResults(labsRes.value.data);
        }

      } catch (err: any) {
        console.error('Error fetching staff dashboard data:', err);
        setError('Failed to load some dashboard data. Some features may be unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffDashboardData();
  }, [user]);

  // Filter data
  const upcomingAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return (apt.status === 'Scheduled' || apt.status === 'Confirmed') && appointmentDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.date).toDateString() === today;
  });

  const activePrescriptions = prescriptions
    .filter(rx => rx.status === 'Pending' || rx.status === 'Active')
    .slice(0, 10);

  const recentLabResults = labResults
    .filter(lab => lab.status === 'Completed' || lab.status === 'Processing')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const stats = [
    { 
      label: 'Today\'s Appointments', 
      value: todayAppointments.length, 
      icon: Calendar, 
      color: 'blue',
      bgColor: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'Upcoming Appointments', 
      value: upcomingAppointments.length, 
      icon: Clock, 
      color: 'green',
      bgColor: 'from-green-500 to-green-600'
    },
    { 
      label: 'Active Prescriptions', 
      value: activePrescriptions.length, 
      icon: Pill, 
      color: 'purple',
      bgColor: 'from-purple-500 to-purple-600'
    },
    { 
      label: 'Recent Lab Results', 
      value: recentLabResults.length, 
      icon: FileText, 
      color: 'orange',
      bgColor: 'from-orange-500 to-orange-600'
    },
    { 
      label: 'Total Patients', 
      value: patients.length, 
      icon: Users, 
      color: 'pink',
      bgColor: 'from-pink-500 to-pink-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff" isAuthenticated={true} userName={user?.name || 'Staff'} />

      <div className="lg:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="mb-8 px-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Staff Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Overview of all appointments, prescriptions, and lab results
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">Partial Data Load</p>
                <p className="text-sm text-yellow-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading staff dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="liquid-glass rounded-2xl p-4 sm:p-6 transition-all hover:shadow-2xl"
                    >
                      <div className={`bg-gradient-to-br ${stat.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-600">
                        {stat.label}
                      </h3>
                    </div>
                  );
                })}
              </div>

              {/* Quick Action: Triage Button */}
              <div className="mb-8 flex justify-end">
                <button
                  onClick={() => navigate('/staff/triage')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                  <Heart className="h-5 w-5" />
                  Go to Triage
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="mb-6 flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedTab('overview')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setSelectedTab('appointments')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedTab === 'appointments'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Appointments
                </button>
                <button
                  onClick={() => setSelectedTab('prescriptions')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedTab === 'prescriptions'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Prescriptions
                </button>
                <button
                  onClick={() => setSelectedTab('labs')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedTab === 'labs'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Lab Results
                </button>
              </div>

              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Upcoming Appointments */}
                  <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                        Upcoming Appointments
                      </h2>
                      <button
                        onClick={() => setSelectedTab('appointments')}
                        className="text-blue-600 hover:underline text-xs sm:text-sm font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {upcomingAppointments.map(apt => (
                          <div
                            key={apt._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {apt.patientId?.name || 'Unknown Patient'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Doctor: {apt.doctorId?.name || 'N/A'}
                                </p>
                              </div>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {apt.status}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {new Date(apt.date).toLocaleDateString()} at {apt.time}
                            </div>
                            {apt.reason && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-semibold">Reason:</span> {apt.reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No upcoming appointments</p>
                      </div>
                    )}
                  </div>

                  {/* Active Prescriptions */}
                  <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                        <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-600" />
                        Active Prescriptions
                      </h2>
                      <button
                        onClick={() => setSelectedTab('prescriptions')}
                        className="text-blue-600 hover:underline text-xs sm:text-sm font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    {activePrescriptions.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {activePrescriptions.map(rx => (
                          <div
                            key={rx._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Patient: {rx.patientId?.name || 'Unknown'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Doctor: {rx.doctorId?.name || 'N/A'}
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  rx.status === 'Dispensed'
                                    ? 'bg-green-100 text-green-800'
                                    : rx.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {rx.status}
                              </span>
                            </div>
                            <div className="space-y-1 mt-3">
                              {rx.medications?.slice(0, 2).map((med: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <p className="font-semibold text-gray-900">
                                    {med.name} - {med.dosage}
                                  </p>
                                  <p className="text-gray-600">{med.frequency}</p>
                                </div>
                              ))}
                              {rx.medications?.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{rx.medications.length - 2} more...
                                </p>
                              )}
                            </div>
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

                  {/* Recent Lab Results */}
                  <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
                        Recent Lab Results
                      </h2>
                      <button
                        onClick={() => setSelectedTab('labs')}
                        className="text-blue-600 hover:underline text-xs sm:text-sm font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    {recentLabResults.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                        {recentLabResults.map(lab => (
                          <div
                            key={lab._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{lab.testType}</h3>
                                <p className="text-sm text-gray-600">
                                  Patient: {lab.patientId?.name || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Doctor: {lab.doctorId?.name || 'N/A'}
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  lab.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : lab.status === 'Processing'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
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
                        <p>No recent lab results</p>
                      </div>
                    )}
                  </div>

                  {/* Patient Health Cards Preview */}
                  <div className="liquid-glass rounded-2xl shadow-xl p-4 sm:p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-orange-600" />
                        Recent Patients
                      </h2>
                    </div>

                    {patients.length > 0 ? (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {patients.slice(0, 8).map(patient => (
                          <div
                            key={patient._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors bg-gradient-to-br from-white to-orange-50"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                {patient.name?.charAt(0) || 'P'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {patient.name}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                  {patient.email}
                                </p>
                              </div>
                            </div>
                            {patient.digitalHealthCardId && (
                              <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                Card: {patient.digitalHealthCardId}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No patient data available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Appointments Tab */}
              {selectedTab === 'appointments' && (
                <div className="liquid-glass rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">All Appointments</h2>
                  {appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.map(apt => (
                        <div key={apt._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Patient</p>
                              <p className="font-semibold">{apt.patientId?.name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Doctor</p>
                              <p className="font-semibold">{apt.doctorId?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date & Time</p>
                              <p className="font-semibold">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No appointments found</p>
                  )}
                </div>
              )}

              {/* All Prescriptions Tab */}
              {selectedTab === 'prescriptions' && (
                <div className="liquid-glass rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">All Prescriptions</h2>
                  {prescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {prescriptions.map(rx => (
                        <div key={rx._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Patient</p>
                              <p className="font-semibold">{rx.patientId?.name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Doctor</p>
                              <p className="font-semibold">{rx.doctorId?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Medications</p>
                              <p className="font-semibold">{rx.medications?.length || 0} items</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                rx.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                                rx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                rx.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {rx.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No prescriptions found</p>
                  )}
                </div>
              )}

              {/* All Lab Results Tab */}
              {selectedTab === 'labs' && (
                <div className="liquid-glass rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">All Lab Results</h2>
                  {labResults.length > 0 ? (
                    <div className="space-y-3">
                      {labResults.map(lab => (
                        <div key={lab._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Patient</p>
                              <p className="font-semibold">{lab.patientId?.name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Test Type</p>
                              <p className="font-semibold">{lab.testType}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-semibold">{new Date(lab.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                lab.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                lab.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                lab.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {lab.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No lab results found</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
