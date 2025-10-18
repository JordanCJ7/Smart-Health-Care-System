import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function DataSync() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="data-sync" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dataSync') || 'Data Sync & Backup'}</h1>
            <p className="text-sm text-gray-600">Run manual sync or manage automated backups</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Run Sync</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg">Configure</button>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl liquid-glass">
          <h2 className="font-semibold mb-4">Backup History</h2>
          <div className="space-y-3">
            <div className="bg-white/70 p-3 rounded-lg border border-gray-100">Oct 10, 2025 — Success</div>
            <div className="bg-white/70 p-3 rounded-lg border border-gray-100">Sep 30, 2025 — Success</div>
          </div>
        </div>
      </div>
    </div>
  );
}
