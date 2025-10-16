import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { User, Plus, Search, Pencil, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const { t } = useLanguage();

  const users = [
    { id: 1, name: 'Dr. Jane Doe', email: 'jane.doe@example.com', role: 'Doctor' },
    { id: 2, name: 'Nurse Sam', email: 'sam.nurse@example.com', role: 'Nurse' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="user-management" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('userManagement') || 'User Management'}</h1>
            <p className="text-sm text-gray-600">Manage hospital accounts and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input placeholder={t('search') || 'Search users'} className="px-4 py-2 rounded-lg border border-gray-200 pl-10" />
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg flex items-center gap-2">
              <Plus className="h-4 w-4" /> {t('addUser') || 'Add User'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl p-6 shadow-xl liquid-glass">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-white/50 transition-colors">
                    <td className="py-3 font-medium">{u.name}</td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">{u.role}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600"><Pencil className="h-4 w-4" /></button>
                        <button className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl p-6 shadow-xl bg-white">
            <h3 className="font-semibold mb-3">Add New User</h3>
            <p className="text-sm text-gray-600 mb-4">Invite staff or create accounts quickly.</p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 rounded-lg">Invite User</button>
          </div>
        </div>
      </div>
    </div>
  );
}
