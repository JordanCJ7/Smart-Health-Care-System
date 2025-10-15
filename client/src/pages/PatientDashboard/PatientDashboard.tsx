import { Calendar, FileText, Pill, CreditCard, User, Activity, Clock } from 'lucide-react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import patientsData from '../../mockData/patientsData.json';
import appointmentsData from '../../mockData/appointmentsData.json';
import labResultsData from '../../mockData/labResultsData.json';
import prescriptionsData from '../../mockData/prescriptionsData.json';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentPatient = patientsData[0];
  const patientAppointments = appointmentsData.filter(apt => apt.patientId === currentPatient.patientId);
  const upcomingAppointments = patientAppointments.filter(apt => apt.status === 'Scheduled');
  const recentLabResults = labResultsData.filter(lab => lab.patientId === currentPatient.patientId).slice(0, 3);
  const activePrescriptions = prescriptionsData.filter(rx => rx.patientId === currentPatient.patientId && rx.status === 'Active');

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
      <Navigation currentPage="dashboard" isAuthenticated={true} userName={currentPatient.name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:ml-[280px]">
        <div className="mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('welcome')}, {currentPatient.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 text-sm sm:text-base">Here's your health dashboard overview</p>
        </div>

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
                  <div key={apt.appointmentId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{apt.doctorName}</h3>
                        <p className="text-sm text-gray-600">{apt.specialization}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {apt.date} at {apt.time}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Reason:</span> {apt.reason}
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

            {recentLabResults.length > 0 ? (
              <div className="space-y-4">
                {recentLabResults.map(lab => (
                  <div key={lab.resultId} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lab.testName}</h3>
                        <p className="text-sm text-gray-600">Ordered by {lab.orderedBy}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Test Date: {lab.testDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      Result Date: {lab.resultDate}
                    </p>
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

            {activePrescriptions.length > 0 ? (
              <div className="space-y-4">
                {activePrescriptions.map(rx => (
                  <div key={rx.prescriptionId} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Prescribed by {rx.doctorName}</h3>
                        <p className="text-sm text-gray-600">Date: {rx.date}</p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {rx.status}
                      </span>
                    </div>
                    <div className="space-y-2 mt-3">
                      {rx.medications.map((med, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-semibold text-gray-900">{med.name} - {med.dosage}</p>
                          <p className="text-gray-600">{med.frequency} for {med.duration}</p>
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
                <p className="text-2xl font-bold">{currentPatient.bloodType}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Total Appointments</p>
                <p className="text-2xl font-bold">{patientAppointments.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Insurance Provider</p>
                <p className="text-lg font-semibold">{currentPatient.insurance.provider}</p>
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
      </div>
    </div>
  );
}
