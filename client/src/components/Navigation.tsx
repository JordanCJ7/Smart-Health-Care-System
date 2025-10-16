import { useState } from 'react';
import { Home, Calendar, FileText, Pill, CreditCard, User, Settings, LogOut, Heart, Globe, Menu, X } from 'lucide-react';
import AdminMenu from './AdminMenu';
import StaffMenu from './StaffMenu';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../pages/navigation';
import { useLanguage } from '../context/LanguageContext';

interface NavigationProps {
  currentPage?: string;
  isAuthenticated?: boolean;
  userName?: string;
}

export default function Navigation({ currentPage, isAuthenticated = false, userName }: NavigationProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { user } = useAuth();

  const navItems = isAuthenticated
    ? [
        { id: 'dashboard', icon: Home, label: t('home') },
        { id: 'appointments', icon: Calendar, label: t('appointments') },
        { id: 'lab-results', icon: FileText, label: t('labResults') },
        { id: 'prescriptions', icon: Pill, label: t('prescriptions') },
        { id: 'health-card', icon: CreditCard, label: t('healthCard') },
        { id: 'profile', icon: User, label: t('profile') },
      ]
    : [
        { id: 'home', icon: Home, label: t('home') },
      ];

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {sidebarOpen ? (
                    <X className="h-6 w-6 text-gray-700" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-700" />
                  )}
                </button>
              )}

              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(isAuthenticated ? 'dashboard' : 'home')}>
                <div className="relative">
                  <Heart className="h-9 w-9 text-blue-600" />
                  <div className="absolute inset-0 bg-blue-600 blur-lg opacity-30 animate-pulse"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  HealthCare+
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 hover:from-blue-100 hover:to-green-100 transition-all"
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium uppercase">{language}</span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 overflow-hidden">
                    {[
                      { code: 'en', name: 'English' },
                      { code: 'si', name: 'සිංහල' },
                      { code: 'ta', name: 'தமிழ்' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'si' | 'ta');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all ${
                          language === lang.code
                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 transition-all shadow-md"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{userName}</span>
                  </button>

                  {showSettings && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 overflow-hidden">
                      <button
                        onClick={() => {
                          navigate('profile');
                          setShowSettings(false);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all text-gray-700"
                      >
                        <User className="h-5 w-5" />
                        <span>{t('profile')}</span>
                      </button>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all text-gray-700"
                      >
                        <Settings className="h-5 w-5" />
                        <span>{t('settings')}</span>
                      </button>
                      <hr className="border-gray-200" />
                      <button
                        onClick={() => {
                          navigate('home');
                          setShowSettings(false);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-red-50 transition-all text-red-600"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('login')}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={() => navigate('register')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all shadow-md font-medium"
                  >
                    {t('register')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isAuthenticated && (
        <>
          <div
            className={`fixed left-0 top-16 bottom-0 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 z-40 transition-transform duration-300 ease-in-out hidden lg:block ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: '280px' }}
          >
            <div className="flex flex-col h-full p-6">
              {user && user.role === 'Admin' ? (
                <AdminMenu currentPage={currentPage} />
              ) : user && user.role === 'Staff' ? (
                <StaffMenu currentPage={currentPage} />
              ) : (
                <>
                  <div className="space-y-2 flex-1">
                    {navItems.map((item) => {
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
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">{t('logout')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/10 z-30 top-16 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div
            className={`fixed left-0 top-16 bottom-0 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 z-40 transition-transform duration-300 ease-in-out lg:hidden ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: '260px' }}
          >
            <div className="flex flex-col h-full p-6">
              <div className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.id as any);
                        setSidebarOpen(false);
                      }}
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
                  onClick={() => {
                    navigate('home');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">{t('logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
