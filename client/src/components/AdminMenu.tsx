import { Users, Calendar, Activity, FileText, Bell, Database, Headphones, FileText as Docs } from 'lucide-react';
import { useNavigate } from '../pages/navigation';
import { useLanguage } from '../context/LanguageContext';

export default function AdminMenu({ currentPage }: { currentPage?: string }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const items = [
    { id: 'admin', icon: Activity, label: t('adminDashboard') || 'Admin Dashboard' },
    { id: 'user-management', icon: Users, label: t('userManagement') || 'User Management' },
    { id: 'department-schedule', icon: Calendar, label: t('departmentSchedule') || 'Departments' },
    { id: 'analytics', icon: Activity, label: t('analytics') || 'Analytics' },
    { id: 'notifications', icon: Bell, label: t('notifications') || 'Notifications' },
    { id: 'data-sync', icon: Database, label: t('dataSync') || 'Data Sync' },
    { id: 'patient-support', icon: Headphones, label: t('patientSupport') || 'Patient Support' },
    { id: 'policies-faqs', icon: Docs, label: t('policiesFaqs') || 'Policies & FAQs' },
  ];

  return (
    <div className="flex flex-col h-full p-6">
      <div className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon as any;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:scale-102'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('home')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <span className="font-medium">{t('logout') || 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}
