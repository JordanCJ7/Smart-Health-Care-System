import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Plus, Edit, Trash2 } from 'lucide-react';

export default function Notifications() {
  const { t } = useLanguage();

  const notifications = [
    { id: 1, title: 'System Maintenance', when: 'Oct 20, 2025 - 02:00 AM', level: 'info' },
    { id: 2, title: 'Lab System Upgrade', when: 'Oct 22, 2025 - 01:00 AM', level: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="notifications" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('systemNotifications') || 'System Notifications'}</h1>
            <p className="text-sm text-gray-600">Manage announcements and alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg flex items-center gap-2"><Plus className="h-4 w-4"/> Create</button>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl liquid-glass">
          <ul className="space-y-4">
            {notifications.map(n => (
              <li key={n.id} className="flex items-center justify-between bg-white/70 p-4 rounded-lg border border-gray-100">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-gray-600">{n.when}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-blue-600"><Edit className="h-4 w-4" /></button>
                  <button className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
