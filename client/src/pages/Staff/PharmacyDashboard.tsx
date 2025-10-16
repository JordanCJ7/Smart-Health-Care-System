import { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import prescriptionsDataRaw from '../../mockData/prescriptionsData.json';
import { Pill } from 'lucide-react';

type Prescription = typeof prescriptionsDataRaw[number];

export default function PharmacyDashboard() {
  const [rxs, setRxs] = useState<Prescription[]>(() => JSON.parse(JSON.stringify(prescriptionsDataRaw)));
  const [message, setMessage] = useState<string | null>(null);

  function dispense(id: string) {
    setRxs(prev => prev.map(r => r.prescriptionId === id ? { ...r, status: 'Dispensed' } : r));
  }

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-pharmacy" isAuthenticated={true} userName={'Pharm'} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
            <p className="text-gray-600">Prescriptions awaiting dispensing and inventory overview.</p>
          </div>
          <div>
            <button onClick={() => setMessage('Stock management opened (demo)')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Manage Stock</button>
          </div>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

  <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><Pill className="h-5 w-5 mr-2 text-pink-600" /> Pending Prescriptions</h2>
            <div className="space-y-3">
              {rxs.map(r => (
                <div key={r.prescriptionId} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.doctorName}</div>
                    <div className="text-sm text-gray-600">{r.date} • {r.medications.map(m => m.name).join(', ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">{r.status}</div>
                    {r.status !== 'Dispensed' && (
                      <button onClick={() => dispense(r.prescriptionId)} className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded">Dispense</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <div className="divide-y divide-gray-100">
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total Prescriptions</div>
                  <div className="font-semibold">{rxs.length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Ready to Dispense</div>
                  <div className="font-semibold">{rxs.filter(r => r.status !== 'Dispensed').length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
