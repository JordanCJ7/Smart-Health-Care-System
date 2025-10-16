import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import labResultsDataRaw from '../../mockData/labResultsData.json';
import { FileText } from 'lucide-react';

type LabOrder = typeof labResultsDataRaw[number];

export default function LabTechnicianDashboard() {
  const [orders, setOrders] = useState<LabOrder[]>(() => JSON.parse(JSON.stringify(labResultsDataRaw)));
  const pending = useMemo(() => orders.filter(o => o.status !== 'Completed'), [orders]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  function setProcessing(id: string) {
    setOrders(prev => prev.map(o => o.resultId === id ? { ...o, status: 'Processing' } : o));
  }

  function completeOrder(id: string) {
    setOrders(prev => prev.map(o => o.resultId === id ? { ...o, status: 'Available' } : o));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-lab" isAuthenticated={true} userName={'LabTech'} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lab Technician Dashboard</h1>
            <p className="text-gray-600">Pending orders, samples and results.</p>
          </div>
          <div>
            <button onClick={() => setMessage('New lab order created (demo)')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">New Order</button>
          </div>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

  <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-green-600" /> Pending Lab Orders</h2>
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.resultId} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.testName}</div>
                    <div className="text-sm text-gray-600">Ordered by {o.orderedBy} • {o.testDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">{o.status}</div>
                    {o.status === 'Ordered' && (
                      <button onClick={() => setProcessing(o.resultId)} className="px-3 py-1 bg-white border rounded">Start</button>
                    )}
                    {o.status !== 'Completed' && (
                      <button onClick={() => completeOrder(o.resultId)} className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded">Mark Available</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
              <div className="divide-y divide-gray-100">
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total Orders</div>
                  <div className="font-semibold">{orders.length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="font-semibold">{pending.length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="font-semibold">{orders.filter(o => o.status === 'Available').length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
