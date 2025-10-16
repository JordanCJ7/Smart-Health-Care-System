import Navigation from '../../components/Navigation';

export default function MedicalHistory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-medical-history" isAuthenticated={true} userName={'Staff'} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical History</h1>
          <p className="text-gray-600 mt-1">Access patient medical history and encounter notes.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="liquid-glass shadow-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">History Timeline</h2>
                <div className="flex items-center gap-2">
                  <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Search visits, diagnoses..." />
                  <select className="px-3 py-2 border rounded-lg text-sm">
                    <option>All</option>
                    <option>Visits</option>
                    <option>Labs</option>
                    <option>Prescriptions</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">General Checkup</div>
                      <div className="text-sm text-gray-600">Blood pressure noted elevated. Advised lifestyle changes.</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">Visit</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">2025-03-12 • Dr. Smith</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">CBC Panel Result</div>
                      <div className="text-sm text-gray-600">All values within normal ranges.</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">Lab</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">2025-02-22 • Lab Dept</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Amlodipine 5mg</div>
                      <div className="text-sm text-gray-600">Once daily for 30 days.</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">Prescription</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">2025-01-18 • Dr. Lee</div>
                </div>
              </div>
            </div>

            <div className="liquid-glass shadow-xl rounded-2xl p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Allergies & Conditions</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-900">Allergies</div>
                  <div className="text-sm text-gray-600 mt-1">Penicillin (rash), Peanuts (anaphylaxis)</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-900">Chronic Conditions</div>
                  <div className="text-sm text-gray-600 mt-1">Hypertension, Seasonal Asthma</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Patient Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Name</div>
                <div className="font-semibold text-gray-900">John Doe</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">DOB</div>
                <div className="font-semibold text-gray-900">1990-05-21</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Blood Type</div>
                <div className="font-semibold text-gray-900">O+</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Last Visit</div>
                <div className="font-semibold text-gray-900">2025-03-12</div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg">View Full Record</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
