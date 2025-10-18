import Navigation from '../../components/Navigation';
import { useEffect, useState } from 'react';

export default function Billing() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-billing" isAuthenticated={true} userName={'Staff'} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billing & Payment</h1>
          <p className="text-gray-600 mt-1">Process invoices, payments, and insurance claims.</p>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div className="liquid-glass shadow-xl rounded-2xl p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Invoices</h2>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">INV-2025-00124</div>
                    <div className="text-sm text-gray-600">John Doe • Cardiology Consultation</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">$120.00</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 inline-block mt-1">Pending</div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">INV-2025-00123</div>
                    <div className="text-sm text-gray-600">Jane Smith • Lab Tests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">$85.00</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 inline-block mt-1">Paid</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="liquid-glass shadow-xl rounded-2xl p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">New Payment</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Invoice ID</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="INV-2025-00124" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Amount</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="$120.00" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Method</label>
                  <select className="mt-1 w-full px-3 py-2 border rounded-lg">
                    <option>Card</option>
                    <option>Cash</option>
                    <option>Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Notes</label>
                  <input className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setMessage('Payment recorded (demo)')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Record Payment</button>
              </div>
            </div>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Pending Invoices</div>
                <div className="font-semibold text-gray-900">7</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Overdue</div>
                <div className="font-semibold text-gray-900">2</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Collected Today</div>
                <div className="font-semibold text-gray-900">$540.00</div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg">Export Report</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
