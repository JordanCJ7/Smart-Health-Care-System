import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { User, Plus, Search, Pencil, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import AddUserModal from '../../components/Admin/AddUserModal';
import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, toggleUserStatus } from '../../services/adminService';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const { t } = useLanguage();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getAllUsers();

      if (response.success) {
        const fetchedUsers = response.data.users || response.data || [];
        setUsers(fetchedUsers);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle user creation
  const handleUserCreated = (newUser: UserRecord) => {
    // Add new user to list
    setUsers(prev => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
  };

  // Get display role - Doctor if specialization exists, otherwise Staff
  const getDisplayRole = (user: UserRecord) => {
    return user.specialization ? 'Doctor' : user.role;
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await deleteUser(userId);

      if (response.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      alert(errorMessage);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await toggleUserStatus(userId);
      if (response.success) {
        fetchUsers(); // Refresh the list
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle user status';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="user-management" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('userManagement') || 'User Management'}</h1>
            <p className="text-sm text-gray-600">Manage hospital accounts and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                placeholder={t('search') || 'Search users'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 pl-10 w-48"
              />
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" /> {t('addUser') || 'Add User'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Table */}
          <div className="lg:col-span-2 rounded-2xl p-6 shadow-xl bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200">
                      <th className="py-3 font-semibold">Name</th>
                      <th className="py-3 font-semibold">Email</th>
                      <th className="py-3 font-semibold">Role</th>
                      <th className="py-3 font-semibold">Status</th>
                      <th className="py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 text-gray-600">{user.email}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getDisplayRole(user) === 'Doctor'
                              ? 'bg-purple-100 text-purple-800'
                              : getDisplayRole(user) === 'Admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getDisplayRole(user)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination info */}
            {!loading && filteredUsers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
            )}
          </div>

          {/* Stats Panel */}
          <div className="rounded-2xl p-6 shadow-xl bg-white">
            <h3 className="font-semibold mb-4 text-gray-900">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-lg font-bold text-blue-600">{users.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-lg font-bold text-green-600">
                  {users.filter(u => u.isActive).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doctors</span>
                <span className="text-lg font-bold text-purple-600">
                  {users.filter(u => u.specialization).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Staff</span>
                <span className="text-lg font-bold text-orange-600">
                  {users.filter(u => !u.specialization && u.role === 'Staff').length}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Create New User
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
