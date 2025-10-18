import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { 
  getAllLabOrders, 
  collectSample, 
  rejectSample,
  updateLabResults,
  updateLabOrderStatus 
} from '../../services/labService';

type LabOrder = {
  _id: string;
  patientId: { _id: string; name: string };
  doctorId: { _id: string; name: string };
  testType: string;
  status: string;
  priority: string;
  clinicalNotes?: string;
  sampleCollectedAt?: string;
  createdAt: string;
};

export default function LabTechnicianDashboard() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const pending = useMemo(() => orders.filter(o => o.status !== 'Completed'), [orders]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [resultsText, setResultsText] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllLabOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch lab orders');
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

  const handleCollectSample = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await collectSample(orderId);
      showMessage('success', 'Sample collected successfully');
      fetchOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to collect sample');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartProcessing = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await updateLabOrderStatus(orderId, 'Processing');
      showMessage('success', 'Lab order set to processing');
      fetchOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenResultsModal = (order: LabOrder) => {
    setSelectedOrder(order);
    setResults({});
    setResultsText('');
    setShowResultsModal(true);
  };

  const handleSubmitResults = async () => {
    if (!selectedOrder) return;
    
    // Parse results - try JSON first, if fails use text as-is
    let finalResults = results;
    if (resultsText.trim()) {
      try {
        finalResults = JSON.parse(resultsText);
      } catch {
        // If not valid JSON, treat as plain text with a "result" key
        finalResults = { result: resultsText.trim() };
      }
    }
    
    if (Object.keys(finalResults).length === 0) {
      showMessage('error', 'Please enter lab results');
      return;
    }
    
    setActionLoading(selectedOrder._id);
    try {
      await updateLabResults(selectedOrder._id, {
        results: finalResults,
        status: 'Completed',
      });
      showMessage('success', 'Lab results submitted successfully');
      setShowResultsModal(false);
      fetchOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to submit results');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-lab" isAuthenticated={true} userName={'LabTech'} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lab Technician Dashboard</h1>
            <p className="text-gray-600">Manage lab orders, samples and results.</p>
          </div>
          <button 
            onClick={fetchOrders} 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            disabled={loading}
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
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" /> Lab Orders
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No lab orders found
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order._id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{order.testType}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.priority === 'STAT' ? 'bg-red-100 text-red-700' :
                            order.priority === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Patient: {order.patientId?.name || 'N/A'} • 
                          Doctor: {order.doctorId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Ordered: {new Date(order.createdAt).toLocaleString()}
                        </div>
                        {order.clinicalNotes && (
                          <div className="text-sm text-gray-600 mt-2 italic">
                            Notes: {order.clinicalNotes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Sample-Collected' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                        <div className="flex gap-2">
                          {order.status === 'Ordered' && (
                            <button 
                              onClick={() => handleCollectSample(order._id)}
                              disabled={actionLoading === order._id}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {actionLoading === order._id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Collect Sample'}
                            </button>
                          )}
                          {order.status === 'Sample-Collected' && (
                            <button 
                              onClick={() => handleStartProcessing(order._id)}
                              disabled={actionLoading === order._id}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                            >
                              {actionLoading === order._id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Start Processing'}
                            </button>
                          )}
                          {order.status === 'Processing' && (
                            <button 
                              onClick={() => handleOpenResultsModal(order)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Submit Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <div className="font-semibold">{orders.filter(o => o.status === 'Completed').length}</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">STAT Priority</div>
                  <div className="font-semibold text-red-600">{orders.filter(o => o.priority === 'STAT').length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Results Modal */}
        {showResultsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Submit Lab Results</h3>
              <div className="mb-4">
                <p className="text-gray-700"><strong>Test:</strong> {selectedOrder.testType}</p>
                <p className="text-gray-700"><strong>Patient:</strong> {selectedOrder.patientId?.name}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lab Results
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Enter results as JSON format or plain text. Examples:<br/>
                    JSON: {`{"hemoglobin": "14.5 g/dL", "wbc": "7500/μL"}`}<br/>
                    Text: Hemoglobin: 14.5 g/dL, WBC: 7500/μL
                  </p>
                  <textarea
                    value={resultsText}
                    onChange={(e) => {
                      const value = e.target.value;
                      setResultsText(value);
                      // Try to parse as JSON for real-time validation
                      try {
                        const parsed = JSON.parse(value);
                        setResults(parsed);
                      } catch {
                        // Not valid JSON yet, that's ok
                        setResults({});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder='Enter results here...'
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResults}
                  disabled={actionLoading === selectedOrder._id || !resultsText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === selectedOrder._id ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Results'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
