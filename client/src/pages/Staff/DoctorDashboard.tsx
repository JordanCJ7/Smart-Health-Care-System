import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import { Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import { getMyAppointments } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';

type Appointment = {
  _id: string;
  patientId: { _id: string; name: string };
  doctorId: { _id: string; name: string };
  date: string;
  time: string;
  status: string;
  reason?: string;
  department?: string;
  createdAt: string;
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = useMemo(
    () => appointments.filter(a => a.date.startsWith(today)),
    [appointments, today]
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await getMyAppointments();
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(id);
  }, [message]);

  function showMessage(type: 'success' | 'error' | 'info', text: string) {
    setMessage({ type, text });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-doctor" isAuthenticated={true} userName={user?.name || 'Doctor'} />
      <div className="lg:pl-[280px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Overview of your appointments and patients</p>
          </div>
          <button 
            onClick={fetchAppointments}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Refresh'}
          </button>
        </div>

        {message && (
          <div className={`p-4 mb-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              message.type === 'success' ? 'text-green-600' :
              message.type === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`} />
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>{message.text}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" /> Today's Appointments
              </h2>
              <div className="text-sm text-gray-600">{todaysAppointments.length} appointments</div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : todaysAppointments.length > 0 ? (
              <div className="space-y-3">
                {todaysAppointments.map(a => (
                  <div key={a._id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg">
                          {a.patientId?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(a.date).toLocaleDateString()} • {a.time}
                        </div>
                        {a.reason && (
                          <div className="text-sm text-gray-600 mt-1">
                            Reason: {a.reason}
                          </div>
                        )}
                        {a.department && (
                          <div className="text-xs text-gray-500 mt-1">
                            Department: {a.department}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          a.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          a.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          a.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No appointments scheduled for today.
              </div>
            )}
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" /> Statistics
              </h3>
              <div className="divide-y divide-gray-100">
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total Appointments</div>
                  <div className="font-semibold">{appointments.length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Today</div>
                  <div className="font-semibold">{todaysAppointments.length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="font-semibold text-green-600">
                    {appointments.filter(a => a.status === 'Completed').length}
                  </div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Upcoming</div>
                  <div className="font-semibold text-blue-600">
                    {appointments.filter(a => ['Scheduled', 'Confirmed'].includes(a.status)).length}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      </div>
    </div>
  );
}
