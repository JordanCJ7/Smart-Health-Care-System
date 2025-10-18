import Navigation from '../../components/Navigation';
import { useEffect, useState } from 'react';

export default function DoctorProfile() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-doctor-profile" isAuthenticated={true} userName={'Staff'} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Doctor's Profile</h1>
          <p className="text-gray-600 mt-1">View and edit doctor's professional profile and schedule.</p>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div className="liquid-glass shadow-xl rounded-2xl p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Full Name</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Dr. Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Specialization</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Cardiology" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Contact Email</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Phone</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="(555) 123-4567" />
                </div>
              </div>
            </div>

            <div className="liquid-glass shadow-xl rounded-2xl p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Schedule Preferences</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Working Days</label>
                  <select className="mt-1 w-full px-3 py-2 border rounded-lg">
                    <option>Mon - Fri</option>
                    <option>Mon - Sat</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Start Time</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="09:00" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">End Time</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="17:00" />
                </div>
              </div>
            </div>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Patients Today</div>
                <div className="font-semibold text-gray-900">12</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Weekly Appointments</div>
                <div className="font-semibold text-gray-900">54</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Department</div>
                <div className="font-semibold text-gray-900">Cardiology</div>
              </div>
              <button onClick={() => setMessage('Profile changes saved (demo)')} className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Save Changes</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
