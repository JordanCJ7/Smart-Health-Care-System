import { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import { Pill, AlertTriangle, CheckCircle, RefreshCw, Package, AlertCircle, Loader2 } from 'lucide-react';
import {
  checkInventoryAvailability,
  requestClarification,
  suggestAlternative,
  dispensePrescription,
  getPendingPrescriptions,
} from '../../services/prescriptionService';
import { createPayment } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

interface Prescription {
  _id: string;
  patientId: { _id: string; name: string };
  doctorId: { _id: string; name: string };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }>;
  status: string;
  createdAt: string;
  refillsRemaining?: number;
}

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [rxs, setRxs] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showModal, setShowModal] = useState<'clarify' | 'alternative' | 'dispense' | 'inventory' | null>(null);
  const [inventoryCheck, setInventoryCheck] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [clarificationReason, setClarificationReason] = useState('');
  const [alternativeMed, setAlternativeMed] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>(['']);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await getPendingPrescriptions();
      if (response.success) {
        setRxs(response.data);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  function showMessage(type: 'success' | 'error' | 'info', text: string) {
    setMessage({ type, text });
  }

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(id);
  }, [message]);

  // Check inventory availability
  const handleCheckInventory = async (rx: Prescription) => {
    if (!rx._id) {
      showMessage('error', 'Invalid prescription');
      return;
    }
    setActionLoading(true);
    try {
      const result = await checkInventoryAvailability(rx._id);
      setInventoryCheck(result.data);
      setSelectedRx(rx);
      setShowModal('inventory');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to check inventory');
    } finally {
      setActionLoading(false);
    }
  };

  // UC-001 Extension 3a: Request clarification
  const handleRequestClarification = async () => {
    if (!selectedRx?._id || !clarificationReason) {
      showMessage('error', 'Please provide a clarification reason');
      return;
    }
    setActionLoading(true);
    try {
      await requestClarification(selectedRx._id, clarificationReason);
      showMessage('success', 'Clarification request sent to doctor');
      setShowModal(null);
      setClarificationReason('');
      fetchPrescriptions();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to send clarification request');
    } finally {
      setActionLoading(false);
    }
  };

  // UC-001 Extension 4a: Suggest alternative
  const handleSuggestAlternative = async () => {
    if (!selectedRx?._id || !alternativeMed || alternatives.filter(a => a).length === 0) {
      showMessage('error', 'Please provide medication name and at least one alternative');
      return;
    }
    setActionLoading(true);
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
      fetchPrescriptions();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to suggest alternatives');
    } finally {
      setActionLoading(false);
    }
  };

  // Dispense with payment
  const handleDispenseWithPayment = async () => {
    if (!selectedRx?._id) {
      showMessage('error', 'Invalid prescription');
      return;
    }
    setActionLoading(true);
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
      fetchPrescriptions(); // Refresh prescriptions list
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to dispense prescription');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-pharmacy" isAuthenticated={true} userName={user?.name || 'Pharmacist'} />
      <div className="lg:pl-[280px]">
      <div className="px-4 py-8 pt-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pharmacy Dashboard</h1>
            <p className="text-gray-600">UC-001: E-Prescription & Pharmacy Dispense</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchPrescriptions}
              disabled={loading}
              className="px-4 py-2 text-white transition rounded-lg bg-gradient-to-r from-blue-600 to-green-600 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <RefreshCw className="inline w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </button>
            <button 
              onClick={() => showMessage('info', 'Stock management opened (demo)')} 
              className="px-4 py-2 transition bg-white border border-gray-200 rounded-lg hover:shadow"
            >
              <Package className="inline w-4 h-4 mr-2" />
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
            {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {message.type === 'info' && <AlertTriangle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3 sm:gap-6">
          <div className="p-6 bg-white shadow-xl lg:col-span-2 rounded-2xl">
            <h2 className="flex items-center mb-4 text-lg font-semibold">
              <Pill className="w-5 h-5 mr-2 text-pink-600" /> Pending Prescription
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : rxs.length > 0 ? (
              <div className="space-y-3">
                {rxs.map(r => (
                  <div key={r._id} className="p-4 transition border border-gray-200 rounded-lg hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-lg font-semibold">{r.doctorId?.name || 'Unknown Doctor'}</div>
                        <div className="text-sm text-gray-600">Patient: {r.patientId?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</div>
                        <div className="mt-1 text-sm text-gray-700">
                          <strong>Medications:</strong> {r.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                        r.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    {r.status !== 'Dispensed' && (
                      <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-gray-100">
                        <button
                          onClick={() => { setSelectedRx(r); handleCheckInventory(r); }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                          disabled={actionLoading}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Check Inventory
                        </button>
                        <button
                          onClick={() => { setSelectedRx(r); setShowModal('clarify'); }}
                          className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm flex items-center"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Clarify (Ext 3a)
                        </button>
                        <button
                          onClick={() => { setSelectedRx(r); setShowModal('alternative'); }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Suggest Alt (Ext 4a)
                        </button>
                        <button
                          onClick={() => { setSelectedRx(r); setShowModal('dispense'); setPaymentAmount(50); }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                        >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Dispense
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                No pending prescriptions at the moment.
              </div>
            )}
          </div>

          <aside className="bg-white shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="mb-3 text-lg font-semibold">Summary</h3>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <div className="text-sm text-gray-600">Total Prescriptions</div>
                  <div className="text-xl font-semibold">{rxs.length}</div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-xl font-semibold text-blue-600">{rxs.filter(r => r.status !== 'Dispensed').length}</div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="text-sm text-gray-600">Dispensed</div>
                  <div className="text-xl font-semibold text-green-600">{rxs.filter(r => r.status === 'Dispensed').length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>        {/* Modals */}
        {showModal === 'clarify' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <h3 className="mb-4 text-xl font-bold">Request Clarification (UC-001 Ext 3a)</h3>
              <p className="mb-4 text-sm text-gray-600">Prescription unclear? Request clarification from doctor.</p>
              <textarea
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                rows={4}
                placeholder="Describe what needs clarification..."
                value={clarificationReason}
                onChange={(e) => setClarificationReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRequestClarification}
                  disabled={loading || !clarificationReason}
                  className="flex-1 px-4 py-2 text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <h3 className="mb-4 text-xl font-bold">Suggest Alternative (UC-001 Ext 4a)</h3>
              <p className="mb-4 text-sm text-gray-600">Drug unavailable? Suggest alternatives to doctor.</p>
              <input
                type="text"
                className="w-full p-2 mb-3 border border-gray-300 rounded"
                placeholder="Unavailable medication name"
                value={alternativeMed}
                onChange={(e) => setAlternativeMed(e.target.value)}
              />
              <label className="block mb-2 text-sm font-semibold">Alternatives:</label>
              {alternatives.map((alt, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
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
                className="mb-4 text-sm text-blue-600 hover:underline"
              >
                + Add another alternative
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleSuggestAlternative}
                  disabled={loading || !alternativeMed}
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <h3 className="mb-4 text-xl font-bold">Dispense Prescription</h3>
              <p className="mb-4 text-sm text-gray-600">Confirm payment and dispense medication.</p>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">Payment Amount ($)</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="p-3 mb-4 text-sm text-blue-800 border border-blue-200 rounded bg-blue-50">
                <strong>Note:</strong> System will check inventory, process payment, update records, and notify patient.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDispenseWithPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg">
              <h3 className="mb-4 text-xl font-bold">Inventory Check Results (UC-001 Step 4)</h3>
              <div className="mb-4 space-y-3">
                {inventoryCheck.medications?.map((med: any, idx: number) => (
                  <div key={idx} className={`border rounded p-3 ${med.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{med.medication}</span>
                      {med.available ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
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
                className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
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
