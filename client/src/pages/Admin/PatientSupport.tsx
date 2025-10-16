import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function PatientSupport() {
  const { t } = useLanguage();

  const tickets = [
    { id: 1, subject: 'Unable to view lab results', user: 'John Doe', status: 'Open' },
    { id: 2, subject: 'Prescription question', user: 'Jane Roe', status: 'Responded' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="patient-support" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('patientSupport') || 'Patient Support'}</h1>
            <p className="text-sm text-gray-600">Respond to patient requests and manage support tickets</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">New Ticket</button>
        </div>

        <div className="rounded-2xl p-6 shadow-xl liquid-glass">
          <ul className="space-y-3">
            {tickets.map(t => (
              <li key={t.id} className="flex items-center justify-between bg-white/70 p-4 rounded-lg border border-gray-100">
                <div>
                  <div className="font-semibold">{t.subject}</div>
                  <div className="text-sm text-gray-600">{t.user}</div>
                </div>
                <div className="text-sm text-gray-600">{t.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
