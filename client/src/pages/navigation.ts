type Page = 'home' | 'register' | 'login' | 'dashboard' | 'appointments' | 'lab-results' | 'prescriptions' | 'profile' | 'health-card' | 'admin' | 'user-management' | 'department-schedule' | 'analytics' | 'notifications' | 'data-sync' | 'patient-support' | 'policies-faqs';

let currentPage: Page = 'home';
let navigationListeners: Array<(page: Page) => void> = [];

// Optional external router navigate function (from react-router)
let routerNavigate: ((to: string) => void) | null = null;

export const setRouterNavigate = (fn: (to: string) => void) => {
  routerNavigate = fn;
};

const pageToPath = (page: Page) => {
  switch (page) {
    case 'home':
      return '/';
    case 'register':
      return '/register';
    case 'login':
      return '/login';
    case 'dashboard':
      return '/dashboard';
    case 'appointments':
      return '/appointments';
    case 'lab-results':
      return '/lab-results';
    case 'prescriptions':
      return '/prescriptions';
    case 'profile':
      return '/profile';
    case 'health-card':
      return '/health-card';
    case 'admin':
      return '/admin';
    case 'user-management':
      return '/admin/users';
    case 'department-schedule':
      return '/admin/departments';
    case 'analytics':
      return '/admin/analytics';
    case 'notifications':
      return '/admin/notifications';
    case 'data-sync':
      return '/admin/data-sync';
    case 'patient-support':
      return '/admin/support';
    case 'policies-faqs':
      return '/admin/policies';
    default:
      return '/';
  }
};

export const useNavigate = () => {
  return (page: Page) => {
    // If react-router bridge is registered, use real routing
    if (routerNavigate) {
      const path = pageToPath(page);
      routerNavigate(path);
      return;
    }

    // Fallback: old in-memory navigation (for backward compatibility)
    currentPage = page;
    navigationListeners.forEach(listener => listener(page));
  };
};

export const useCurrentPage = () => currentPage;

export const addNavigationListener = (listener: (page: Page) => void) => {
  navigationListeners.push(listener);
  return () => {
    navigationListeners = navigationListeners.filter(l => l !== listener);
  };
};

export default {};
