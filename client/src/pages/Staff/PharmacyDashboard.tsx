import { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import prescriptionsDataRaw from '../../mockData/prescriptionsData.json';
import { Pill, AlertTriangle, CheckCircle, RefreshCw, Package, AlertCircle } from 'lucide-react';
import {
  checkInventoryAvailability,
  requestClarification,
  suggestAlternative,
  dispensePrescription,
} from '../../services/prescriptionService';
import { createPayment } from '../../services/paymentService';

type Prescription = typeof prescriptionsDataRaw[number] & {
  _id?: string;
  patientId?: { _id: string; name: string };
  doctorId?: { _id: string; name: string };
};

export default function PharmacyDashboard() {
  const [rxs, setRxs] = useState<Prescription[]>(() => JSON.parse(JSON.stringify(prescriptionsDataRaw)));
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showModal, setShowModal] = useState<'clarify' | 'alternative' | 'dispense' | 'inventory' | null>(null);
  const [inventoryCheck, setInventoryCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [clarificationReason, setClarificationReason] = useState('');
  const [alternativeMed, setAlternativeMed] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>(['']);
  const [paymentAmount, setPaymentAmount] = useState(0);

  function dispense(id: string) {
    setRxs(prev => prev.map(r => r.prescriptionId === id ? { ...r, status: 'Dispensed' } : r));
    showMessage('success', 'Prescription dispensed successfully');
  }

  function showMessage(type: 'success' | 'error' | 'info', text: string) {
    setMessage({ type, text });
  }

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(id);
  }, [message]);

  // UC-001 Step 4: Check inventory availability
  const handleCheckInventory = async (rx: Prescription) => {
    if (!rx._id) {
      showMessage('error', 'Demo mode: Real inventory check requires backend integration');
      return;
    }
    setLoading(true);
    try {
      const result = await checkInventoryAvailability(rx._id);
      setInventoryCheck(result.data);
      setSelectedRx(rx);
      setShowModal('inventory');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to check inventory');
    } finally {
      setLoading(false);
    }
  };

  // UC-001 Extension 3a: Request clarification
  const handleRequestClarification = async () => {
    if (!selectedRx?._id || !clarificationReason) {
      showMessage('error', 'Please provide a clarification reason');
      return;
    }
    setLoading(true);
    try {
      await requestClarification(selectedRx._id, clarificationReason);
      showMessage('success', 'Clarification request sent to doctor');
      setShowModal(null);
      setClarificationReason('');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to send clarification request');
    } finally {
      setLoading(false);
    }
  };

  // UC-001 Extension 4a: Suggest alternative
  const handleSuggestAlternative = async () => {
    if (!selectedRx?._id || !alternativeMed || alternatives.filter(a => a).length === 0) {
      showMessage('error', 'Please provide medication name and at least one alternative');
      return;
    }
    setLoading(true);
    try {
      await suggestAlternative(
        selectedRx._id,
        alternativeMed,
        alternatives.filter(a => a),
        'Drug unavailable in inventory'
      );
      showMessage('success', 'Alternative suggestions sent to doctor');
      setShowModal(null);
      setAlternativeMed('');
      setAlternatives(['']);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to suggest alternatives');
    } finally {
      setLoading(false);
    }
  };

  // UC-001 Steps 5-8: Dispense with payment
  const handleDispenseWithPayment = async () => {
    if (!selectedRx?._id) {
      showMessage('error', 'Demo mode: Real dispense requires backend integration');
      dispense(selectedRx?.prescriptionId || '');
      setShowModal(null);
      return;
    }
    setLoading(true);
    try {
      // First create payment if amount > 0
      let paymentId;
      if (paymentAmount > 0) {
        const paymentResult = await createPayment({
          amount: paymentAmount,
          description: `Prescription ${selectedRx._id}`,
        });
        paymentId = paymentResult.data.payment._id;
      }

      // Then dispense
      const result = await dispensePrescription(selectedRx._id, paymentId);
      
      if (result.data.unavailableItems && result.data.unavailableItems.length > 0) {
        showMessage('info', 'Prescription partially dispensed. Doctor has been notified.');
      } else {
        showMessage('success', 'Prescription fully dispensed');
      }
      
      setShowModal(null);
      // Refresh prescriptions list
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to dispense prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-pharmacy" isAuthenticated={true} userName={'Pharm'} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
            <p className="text-gray-600">UC-001: E-Prescription & Pharmacy Dispense</p>
          </div>
          <div>
            <button onClick={() => showMessage('info', 'Stock management opened (demo)')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition">
              <Package className="inline h-4 w-4 mr-2" />
              Manage Stock
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-4 rounded-lg border flex items-center ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <AlertTriangle className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Pill className="h-5 w-5 mr-2 text-pink-600" /> Pending Prescriptions (UC-001 Step 1)
            </h2>
            <div className="space-y-3">
              {rxs.map(r => (
                <div key={r.prescriptionId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg">{r.doctorName}</div>
                      <div className="text-sm text-gray-600">{r.date}</div>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Medications:</strong> {r.medications.map(m => m.name).join(', ')}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                      r.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  {r.status !== 'Dispensed' && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => { setSelectedRx(r); handleCheckInventory(r); }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                        disabled={loading}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Check Inventory (Step 4)
                      </button>
                      <button
                        onClick={() => { setSelectedRx(r); setShowModal('clarify'); }}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm flex items-center"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Clarify (Ext 3a)
                      </button>
                      <button
                        onClick={() => { setSelectedRx(r); setShowModal('alternative'); }}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Suggest Alt (Ext 4a)
                      </button>
                      <button
                        onClick={() => { setSelectedRx(r); setShowModal('dispense'); setPaymentAmount(50); }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Dispense (Step 5-8)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-white shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <div className="divide-y divide-gray-100">
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total Prescriptions</div>
                  <div className="font-semibold text-xl">{rxs.length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="font-semibold text-xl text-blue-600">{rxs.filter(r => r.status !== 'Dispensed').length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Dispensed</div>
                  <div className="font-semibold text-xl text-green-600">{rxs.filter(r => r.status === 'Dispensed').length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Modals */}
        {showModal === 'clarify' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Request Clarification (UC-001 Ext 3a)</h3>
              <p className="text-sm text-gray-600 mb-4">Prescription unclear? Request clarification from doctor.</p>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-4"
                rows={4}
                placeholder="Describe what needs clarification..."
                value={clarificationReason}
                onChange={(e) => setClarificationReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRequestClarification}
                  disabled={loading || !clarificationReason}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  onClick={() => { setShowModal(null); setClarificationReason(''); }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal === 'alternative' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Suggest Alternative (UC-001 Ext 4a)</h3>
              <p className="text-sm text-gray-600 mb-4">Drug unavailable? Suggest alternatives to doctor.</p>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 mb-3"
                placeholder="Unavailable medication name"
                value={alternativeMed}
                onChange={(e) => setAlternativeMed(e.target.value)}
              />
              <label className="block text-sm font-semibold mb-2">Alternatives:</label>
              {alternatives.map((alt, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 mb-2"
                  placeholder={`Alternative ${idx + 1}`}
                  value={alt}
                  onChange={(e) => {
                    const newAlts = [...alternatives];
                    newAlts[idx] = e.target.value;
                    setAlternatives(newAlts);
                  }}
                />
              ))}
              <button
                onClick={() => setAlternatives([...alternatives, ''])}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                + Add another alternative
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleSuggestAlternative}
                  disabled={loading || !alternativeMed}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Suggest Alternatives'}
                </button>
                <button
                  onClick={() => { setShowModal(null); setAlternativeMed(''); setAlternatives(['']); }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal === 'dispense' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Dispense Prescription (UC-001 Step 5-8)</h3>
              <p className="text-sm text-gray-600 mb-4">Confirm payment and dispense medication.</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Payment Amount ($)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded p-2"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
                <strong>Note:</strong> System will check inventory, process payment, update records, and notify patient.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDispenseWithPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Dispensing...' : 'Confirm & Dispense'}
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal === 'inventory' && inventoryCheck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4">Inventory Check Results (UC-001 Step 4)</h3>
              <div className="space-y-3 mb-4">
                {inventoryCheck.medications?.map((med: any, idx: number) => (
                  <div key={idx} className={`border rounded p-3 ${med.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{med.medication}</span>
                      {med.available ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    {med.available ? (
                      <p className="text-sm text-green-700">Available: {med.availableQuantity} units</p>
                    ) : (
                      <div className="text-sm text-red-700">
                        <p><strong>Reason:</strong> {med.reason}</p>
                        {med.alternatives && med.alternatives.length > 0 && (
                          <p className="mt-1"><strong>Alternatives:</strong> {med.alternatives.map((a: any) => a.drugName).join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className={`p-3 rounded ${inventoryCheck.allAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>{inventoryCheck.allAvailable ? '✓ All medications available' : '⚠ Some medications unavailable'}</strong>
              </div>
              <button
                onClick={() => { setShowModal(null); setInventoryCheck(null); }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
