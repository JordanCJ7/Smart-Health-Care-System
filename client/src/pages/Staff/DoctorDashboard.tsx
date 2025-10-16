import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import appointmentsData from '../../mockData/appointmentsData.json';
import patientsData from '../../mockData/patientsData.json';
import { Calendar, User } from 'lucide-react';

export default function DoctorDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = useMemo(() => appointmentsData.filter(a => a.date === today), [today]);
  const recentPatients = useMemo(() => patientsData.slice(0, 4), []);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation currentPage="staff-doctor" isAuthenticated={true} userName={'Dr. You'} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Overview of your appointments and patients</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMessage('New note created (demo)')} className="px-4 py-2 bg-white rounded-lg shadow">New Note</button>
            <button onClick={() => setMessage('Rounds started (demo)')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Start Rounds</button>
          </div>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center"><Calendar className="h-5 w-5 mr-2 text-blue-600" /> Today's Appointments</h2>
              <div className="text-sm text-gray-600">{todaysAppointments.length} appointments</div>
            </div>

            {todaysAppointments.length > 0 ? (
              <div className="space-y-3">
                {todaysAppointments.map(a => (
                  <div key={a.appointmentId} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.doctorName} — {a.specialization}</div>
                      <div className="text-sm text-gray-600">{a.date} • {a.time} • {a.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{a.department}</div>
                      <div className="mt-2 text-xs px-2 py-1 bg-green-50 rounded-full text-green-700">{a.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">No appointments scheduled for today.</div>
            )}
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center"><User className="h-5 w-5 mr-2 text-indigo-600" /> Quick Patients</h3>
              <div className="divide-y divide-gray-100">
                {recentPatients.map((p, idx) => (
                  <div key={p.patientId} className={`py-3 flex items-center justify-between ${idx === 0 ? '' : ''}`}>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-600">{p.phone}</div>
                    </div>
                    <div className="text-xs text-gray-500">DOB: {p.dateOfBirth}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
