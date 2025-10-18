import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, Users } from 'lucide-react';

export default function DepartmentSchedule() {
  const { t } = useLanguage();

  const departments = [
    { id: 'cardio', name: 'Cardiology', staff: 'Dr. A, Dr. B', schedule: 'Mon-Fri 08:00-16:00' },
    { id: 'er', name: 'Emergency', staff: 'Nurse Team', schedule: '24/7' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="department-schedule" isAuthenticated={true} userName={'Admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('departmentSchedule') || 'Department & Schedule'}</h1>
            <p className="text-sm text-gray-600">Organize departments and manage staff schedules</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Add Department</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((d) => (
            <div key={d.id} className="rounded-2xl p-6 shadow-xl bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{d.name}</h3>
                  <p className="text-sm text-gray-600">{d.staff}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">Schedule</div>
                <div className="font-medium">{d.schedule}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
