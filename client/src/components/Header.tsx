import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
  if (isLoginOrRegister) return null;
  return (
    <header className="bg-white/90 backdrop-blur-xl shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">HealthCare+</div>
          {user?.role === 'Admin' && <div className="text-sm text-gray-600">Admin Console</div>}
        </div>
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-700" />
              <span className="font-medium">{user.name}</span>
              <button onClick={logout} className="ml-4 text-red-600 hover:text-red-700"><LogOut className="h-5 w-5" /></button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
