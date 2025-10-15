type Page = 'home' | 'register' | 'login' | 'dashboard' | 'appointments' | 'lab-results' | 'prescriptions' | 'profile' | 'health-card';

let currentPage: Page = 'home';
let navigationListeners: Array<(page: Page) => void> = [];

export const useNavigate = () => {
  return (page: Page) => {
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
