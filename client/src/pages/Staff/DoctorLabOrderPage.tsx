import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { 
  Search, User, FileText, TestTube, AlertTriangle, Clock, 
  Plus, CheckCircle, Loader2, XCircle, Calendar, Stethoscope 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as labService from '../../services/labService';
import * as userService from '../../services/userService';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  digitalHealthCardId?: string;
}

interface LabOrder {
  _id: string;
  patientId: Patient;
  doctorId: any;
  testType: string;
  status: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  clinicalNotes?: string;
  results?: any;
  interpretation?: string;
  followUpActions?: string;
  criticalAlert?: boolean;
  createdAt: string;
  completedAt?: string;
}

const TEST_TYPES = [
  'Complete Blood Count (CBC)',
  'Basic Metabolic Panel (BMP)',
  'Comprehensive Metabolic Panel (CMP)',
  'Lipid Panel',
  'Liver Function Tests (LFT)',
  'Thyroid Function Tests (TSH, T3, T4)',
  'Hemoglobin A1C (HbA1c)',
  'Urinalysis',
  'Blood Glucose (Fasting/Random)',
  'Electrolyte Panel',
  'Coagulation Panel (PT/INR, PTT)',
  'C-Reactive Protein (CRP)',
  'Vitamin D',
  'Iron Studies',
  'Kidney Function Tests (Creatinine, BUN)',
  'Cardiac Enzymes (Troponin, CK-MB)',
  'Blood Culture',
  'COVID-19 PCR',
  'Pregnancy Test (hCG)',
  'Other'
];

export default function DoctorLabOrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<'order' | 'results' | 'pending'>('order');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Order form
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTest, setCustomTest] = useState('');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'STAT'>('Routine');
  const [clinicalNotes, setClinicalNotes] = useState('');
  
  // Interpretation modal
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showInterpretationModal, setShowInterpretationModal] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [followUpActions, setFollowUpActions] = useState('');

  useEffect(() => {
    fetchAllPatients();
    fetchLabOrders();
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(id);
  }, [message]);

  const fetchAllPatients = async () => {
    setLoading(true);
    try {
      // Fetch all patients using the staff-accessible endpoint
      const response = await userService.getAllPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabOrders = async () => {
    try {
      const response = await labService.getAllLabOrders();
      if (response.success) {
        setLabOrders(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch lab orders:', error);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.digitalHealthCardId?.includes(searchQuery)
  );

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
  };

  const handleTestToggle = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter(t => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleAddCustomTest = () => {
    if (customTest.trim() && !selectedTests.includes(customTest)) {
      setSelectedTests([...selectedTests, customTest]);
      setCustomTest('');
    }
  };

  const handleSubmitOrder = async () => {
    // Step 1: Verify patient selected
    if (!selectedPatient) {
      showMessage('error', 'Please select a patient');
      return;
    }

    // Step 3: Verify at least one test selected
    if (selectedTests.length === 0) {
      showMessage('error', 'Please select at least one test');
      return;
    }

    setSubmitting(true);
    
    try {
      // Step 4: Submit each test order
      const orderPromises = selectedTests.map(testType =>
        labService.createLabOrder({
          patientId: selectedPatient._id,
          testType,
          priority,
          clinicalNotes: clinicalNotes.trim() || undefined
        })
      );

      const results = await Promise.allSettled(orderPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      if (successful === selectedTests.length) {
        showMessage('success', `Successfully ordered ${successful} test(s) for ${selectedPatient.name}`);
        
        // Reset form
        setSelectedTests([]);
        setClinicalNotes('');
        setPriority('Routine');
        setSelectedPatient(null);
        setSearchQuery('');
        
        // Refresh lab orders
        fetchLabOrders();
      } else {
        showMessage('error', `Only ${successful} of ${selectedTests.length} tests were ordered successfully`);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to submit lab orders');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenInterpretation = (order: LabOrder) => {
    setSelectedOrder(order);
    setInterpretation(order.interpretation || '');
    setFollowUpActions(order.followUpActions || '');
    setShowInterpretationModal(true);
  };

  const handleSubmitInterpretation = async () => {
    if (!selectedOrder) return;
    
    setSubmitting(true);
    try {
      await labService.addDoctorInterpretation(selectedOrder._id, {
        interpretation,
        followUpActions
      });
      
      showMessage('success', 'Interpretation added successfully');
      setShowInterpretationModal(false);
      fetchLabOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to add interpretation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledgeCritical = async (orderId: string) => {
    try {
      await labService.acknowledgeCriticalAlert(orderId);
      showMessage('success', 'Critical alert acknowledged');
      fetchLabOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to acknowledge alert');
    }
  };

  const pendingOrders = labOrders.filter(o => o.status === 'Ordered' || o.status === 'Sample-Collected' || o.status === 'Processing');
  const completedOrders = labOrders.filter(o => o.status === 'Completed');
  const criticalOrders = labOrders.filter(o => o.criticalAlert && !o.interpretation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-doctor" isAuthenticated={true} userName={user?.name || 'Doctor'} />
      
      <div className="lg:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TestTube className="h-8 w-8 text-blue-600" />
              Laboratory Test Management
            </h1>
            <p className="text-gray-600 mt-1">Order tests, review results, and add clinical interpretations</p>
          </div>

          {/* Critical Alerts */}
          {criticalOrders.length > 0 && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900">Critical Values Alert!</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {criticalOrders.length} lab result(s) contain critical values requiring immediate attention
                  </p>
                  <button
                    onClick={() => setActiveTab('results')}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    Review Critical Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {message.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {message.type === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {message.type === 'info' && <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>{message.text}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('order')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'order'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Plus className="h-5 w-5" />
              Order Lab Test
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-5 w-5" />
              Pending Orders ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              Completed Results ({completedOrders.length})
              {criticalOrders.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {criticalOrders.length}
                </span>
              )}
            </button>
          </div>

          {/* Order Lab Test Tab */}
          {activeTab === 'order' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Step 1 & 2: Patient Selection */}
              <div className="lg:col-span-1 liquid-glass rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Step 1: Select Patient
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Patient
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name, email, or health card ID..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No patients found</p>
                    ) : (
                      filteredPatients.map(patient => (
                        <div
                          key={patient._id}
                          onClick={() => setSelectedPatient(patient)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedPatient?._id === patient._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.email}</div>
                          {patient.digitalHealthCardId && (
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {patient.digitalHealthCardId}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Test Selection & Order Details */}
              <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-green-600" />
                  Step 2: Select Tests & Set Priority
                </h2>

                {!selectedPatient ? (
                  <div className="text-center py-12 text-gray-500">
                    <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Please select a patient first</p>
                  </div>
                ) : (
                  <>
                    {/* Selected Patient Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Patient: {selectedPatient.name}</div>
                          <div className="text-sm text-gray-600">{selectedPatient.email}</div>
                        </div>
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Change Patient
                        </button>
                      </div>
                    </div>

                    {/* Priority Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Routine', 'Urgent', 'STAT'] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setPriority(p)}
                            className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                              priority === p
                                ? p === 'STAT' ? 'border-red-500 bg-red-50 text-red-700' :
                                  p === 'Urgent' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                                  'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Tests ({selectedTests.length} selected)
                      </label>
                      <div className="grid sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        {TEST_TYPES.map(test => (
                          <label
                            key={test}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedTests.includes(test)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedTests.includes(test)}
                              onChange={() => handleTestToggle(test)}
                              className="mr-3 h-4 w-4"
                            />
                            <span className="text-sm text-gray-900">{test}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Custom Test */}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={customTest}
                          onChange={(e) => setCustomTest(e.target.value)}
                          placeholder="Enter custom test name..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTest()}
                        />
                        <button
                          onClick={handleAddCustomTest}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical Notes (Optional)
                      </label>
                      <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        rows={4}
                        placeholder="Add any relevant clinical information, symptoms, or special instructions..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Step 4: Submit Order */}
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting || selectedTests.length === 0}
                      className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                        submitting || selectedTests.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                      }`}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting Orders...
                        </span>
                      ) : (
                        `Submit ${selectedTests.length} Test Order${selectedTests.length !== 1 ? 's' : ''}`
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pending Orders Tab */}
          {activeTab === 'pending' && (
            <div className="liquid-glass rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-6">Pending Lab Orders</h2>
              
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No pending lab orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{order.testType}</h3>
                          <p className="text-sm text-gray-600">Patient: {order.patientId.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Ordered: {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.priority === 'STAT' ? 'bg-red-100 text-red-800' :
                            order.priority === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Sample-Collected' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      {order.clinicalNotes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Clinical Notes:</span> {order.clinicalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 10: Completed Results Tab */}
          {activeTab === 'results' && (
            <div className="liquid-glass rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-6">Completed Lab Results</h2>
              
              {completedOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No completed lab results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedOrders.map(order => (
                    <div key={order._id} className={`border-2 rounded-lg p-6 transition-shadow ${
                      order.criticalAlert && !order.interpretation
                        ? 'border-red-300 bg-red-50 shadow-lg'
                        : 'border-gray-200 hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{order.testType}</h3>
                            {order.criticalAlert && !order.interpretation && (
                              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Patient: {order.patientId.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Completed: {order.completedAt ? new Date(order.completedAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {order.results && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Test Results:</h4>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(order.results, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {order.interpretation ? (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Your Interpretation:
                          </h4>
                          <p className="text-sm text-gray-700 mb-2">{order.interpretation}</p>
                          {order.followUpActions && (
                            <>
                              <h4 className="font-semibold text-sm text-blue-900 mb-2 mt-3">Follow-up Actions:</h4>
                              <p className="text-sm text-gray-700">{order.followUpActions}</p>
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          {order.criticalAlert && (
                            <button
                              onClick={() => handleAcknowledgeCritical(order._id)}
                              className="w-full mb-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                            >
                              Acknowledge Critical Alert
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenInterpretation(order)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                          >
                            Add Interpretation & Follow-up
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interpretation Modal */}
      {showInterpretationModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Clinical Interpretation</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedOrder.testType} - {selectedOrder.patientId.name}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedOrder.results && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Test Results:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedOrder.results, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Interpretation *
                </label>
                <textarea
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  rows={6}
                  placeholder="Enter your clinical interpretation of the results..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Actions
                </label>
                <textarea
                  value={followUpActions}
                  onChange={(e) => setFollowUpActions(e.target.value)}
                  rows={4}
                  placeholder="Specify any necessary follow-up actions or next steps..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowInterpretationModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInterpretation}
                disabled={submitting || !interpretation.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  submitting || !interpretation.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Saving...' : 'Save Interpretation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
