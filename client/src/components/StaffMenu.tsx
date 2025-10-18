import { ClipboardList, UserCheck, Activity, Beaker, Box, FileText, CreditCard, User, LayoutDashboard } from 'lucide-react';
import { useNavigate } from '../pages/navigation';
import { useLanguage } from '../context/LanguageContext';

// Map soft ids to navigation Page keys
const pageKeyFor = (id: string) => {
  switch (id) {
    case 'dashboard':
      return 'staff';
    case 'triage':
      return 'staff';
    case 'doctor':
      return 'staff-doctor';
    case 'lab':
      return 'staff-lab';
    case 'pharmacy':
      return 'staff-pharmacy';
    case 'e-prescription':
      return 'staff-e-prescription';
    case 'medical-history':
      return 'staff-medical-history';
    case 'billing':
      return 'staff-billing';
    default:
      return 'staff';
  }
};

export default function StaffMenu({ currentPage }: { currentPage?: string }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Staff Dashboard' },
    { id: 'triage', icon: Activity, label: 'Triage & Admission' },
    { id: 'doctor', icon: UserCheck, label: 'Doctor Dashboard' },
    { id: 'lab', icon: Beaker, label: 'Lab Technician' },
    { id: 'pharmacy', icon: Box, label: 'Pharmacy' },
    { id: 'e-prescription', icon: FileText, label: 'E-Prescription' },
  ];

  const subpages = [
    { id: 'medical-history', icon: ClipboardList, label: "Medical History" },
    { id: 'billing', icon: CreditCard, label: 'Billing & Payment' },
  ];

  // derive active id from currentPage (which is the Page key like 'staff-doctor')
  const activeId = (() => {
    if (!currentPage) return undefined;
    if (currentPage === 'staff') return 'staff';
    if (currentPage.startsWith('staff-')) return currentPage.replace('staff-', '').replace('-profile', 'profile');
    return undefined;
  })();

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 space-y-2">
        {items.map((item) => {
          const Icon = item.icon as any;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(pageKeyFor(item.id) as any)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:scale-102'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{t(item.id) || item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-200">
          {subpages.map((s) => {
            const Icon = s.icon as any;
            const isActive = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => navigate(pageKeyFor(s.id) as any)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-102'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(s.id) || s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('home' as any)}
          className="flex items-center w-full px-4 py-3 space-x-3 text-red-600 transition-all rounded-xl hover:bg-red-50"
        >
          <span className="font-medium">{t('logout') || 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}
