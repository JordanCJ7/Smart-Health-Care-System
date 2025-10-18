import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function PoliciesFaqs() {
  const { t } = useLanguage();

  const faqs = [
    { q: 'How do I book an appointment?', a: 'Use the Book Appointment flow on the homepage.' },
    { q: 'How do I view lab results?', a: 'Visit the Lab Results section in your dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="policies-faqs" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('policiesFaqs') || 'Hospital Policies & FAQs'}</h1>
            <p className="text-sm text-gray-600">Manage internal policies and public FAQs</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Add FAQ</button>
        </div>

        <div className="rounded-2xl p-6 shadow-xl liquid-glass">
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white/70 p-4 rounded-lg border border-gray-100">
                <div className="font-semibold">{f.q}</div>
                <div className="text-sm text-gray-600 mt-1">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
