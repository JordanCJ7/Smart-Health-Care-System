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
  <div className="px-4 py-8 pt-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Billing & Payment</h1>
          <p className="mt-1 text-gray-600">Process invoices, payments, and insurance claims.</p>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

        <div className="grid gap-4 lg:grid-cols-3 sm:gap-6">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div className="p-6 shadow-xl liquid-glass rounded-2xl">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">Invoices</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">INV-2025-00124</div>
                    <div className="text-sm text-gray-600">John Doe • Cardiology Consultation</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">$120.00</div>
                    <div className="inline-block px-2 py-1 mt-1 text-xs text-yellow-700 rounded-full bg-yellow-50">Pending</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">INV-2025-00123</div>
                    <div className="text-sm text-gray-600">Jane Smith • Lab Tests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">$85.00</div>
                    <div className="inline-block px-2 py-1 mt-1 text-xs text-green-700 rounded-full bg-green-50">Paid</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 shadow-xl liquid-glass rounded-2xl">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">New Payment</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-600">Invoice ID</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-lg" placeholder="INV-2025-00124" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Amount</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-lg" placeholder="$120.00" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Method</label>
                  <select className="w-full px-3 py-2 mt-1 border rounded-lg">
                    <option>Card</option>
                    <option>Cash</option>
                    <option>Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Notes</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-lg" placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setMessage('Payment recorded')} className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-blue-600 to-green-600">Record Payment</button>
              </div>
            </div>
          </div>

          <aside className="p-6 shadow-xl liquid-glass rounded-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Billing Summary</h3>
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
              <button className="w-full px-4 py-2 mt-4 bg-white border border-gray-200 rounded-lg">Export Report</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
