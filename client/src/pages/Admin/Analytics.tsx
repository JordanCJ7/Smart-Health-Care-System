import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart2, Users, Calendar, Activity, Bell, Database, Headphones, FileText as Docs } from 'lucide-react';
export default function Analytics() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="analytics" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('analytics') || 'Analytics'}</h1>
            <p className="text-sm text-gray-600">Key performance indicators and trends</p>
          </div>
          <div className="flex gap-3">
            <button className="px-3 py-1 bg-white rounded-lg shadow">Export</button>
            <button className="px-3 py-1 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="rounded-2xl p-5 shadow-xl bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Visits</div>
                <div className="text-2xl font-bold">12,345</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-5 shadow-xl bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Avg Wait</div>
                <div className="text-2xl font-bold">22 mins</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <BarChart2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-5 shadow-xl bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Lab Throughput</div>
                <div className="text-2xl font-bold">95%</div>
              </div>
              <div className="bg-rose-50 p-3 rounded-lg">
                <BarChart2 className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl liquid-glass">
          <h2 className="font-semibold mb-4">Traffic Trend</h2>
          <div className="h-64 bg-white/50 rounded-lg flex items-center justify-center text-gray-500">[Chart placeholder]</div>
        </div>
      </div>
    </div>
  );
}
