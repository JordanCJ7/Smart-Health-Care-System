import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Calendar, Activity, FileText, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="admin" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{t('adminDashboard') || 'Admin Dashboard'}</h1>
            <p className="text-gray-600 mt-1">Overview of hospital operations and quick actions</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg text-gray-700">Settings</button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow">New Announcement</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-white/70 to-white/50 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Total Users</h3>
                <div className="text-2xl font-bold text-gray-900">3,482</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">+4.2% in the last month</p>
          </div>

          <div className="rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-white/70 to-white/50 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Appointments Today</h3>
                <div className="text-2xl font-bold text-gray-900">128</div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Average wait time: 18 mins</p>
          </div>

          <div className="rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-white/70 to-white/50 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Pending Notifications</h3>
                <div className="text-2xl font-bold text-gray-900">6</div>
              </div>
              <div className="bg-rose-100 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-rose-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">2 urgent alerts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl p-6 shadow-xl liquid-glass">
            <h2 className="text-lg font-semibold mb-4">Activity Feed</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2" />
                <div>
                  <div className="font-semibold">New lab results uploaded</div>
                  <div className="text-sm text-gray-600">Cardiology lab — Uploaded by LabTech</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full mt-2" />
                <div>
                  <div className="font-semibold">3 new staff accounts approved</div>
                  <div className="text-sm text-gray-600">HR team</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-xl liquid-glass">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-3">
              <button className="px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Create Notification</button>
              <button className="px-4 py-3 bg-white border border-gray-200 rounded-lg">Manage Users</button>
              <button className="px-4 py-3 bg-white border border-gray-200 rounded-lg">View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
