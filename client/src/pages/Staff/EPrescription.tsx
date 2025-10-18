import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { 
  createPrescription, 
  getDoctorPrescriptions 
} from '../../services/prescriptionService';
import { searchPatients } from '../../services/medicalHistoryService';
import { useAuth } from '../../context/AuthContext';

interface Patient {
  _id: string;
  name: string;
  email: string;
}

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

export default function EPrescription() {
  const { user } = useAuth();
  const [list, setList] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  
  const [form, setForm] = useState({ 
    patientId: '', 
    medication: '', 
    dosage: '', 
    frequency: '', 
    duration: '',
    instructions: '',
    refillsRemaining: 0
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await getDoctorPrescriptions();
      if (response.success) {
        setList(response.data);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (search: string = '') => {
    try {
      const response = await searchPatients(search);
      if (response.success) {
        setPatients(response.data.users || []);
        if (response.data.users?.length > 0 && !form.patientId) {
          setForm(f => ({ ...f, patientId: response.data.users[0]._id }));
        }
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch patients');
    }
  };

  const handlePatientSearch = (searchText: string) => {
    setPatientSearch(searchText);
    if (searchText.length >= 2) {
      fetchPatients(searchText);
    }
  };

  async function createPrescriptionHandler(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.patientId || !form.medication || !form.dosage || !form.frequency) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const prescriptionData = {
        patientId: form.patientId,
        medications: [{
          name: form.medication,
          dosage: form.dosage,
          frequency: form.frequency,
          duration: form.duration,
          instructions: form.instructions
        }],
        refillsRemaining: form.refillsRemaining
      };

      const response = await createPrescription(prescriptionData);
      
      if (response.success) {
        showMessage('success', 'Prescription created successfully');
        setForm({ 
          patientId: patients[0]?._id || '', 
          medication: '', 
          dosage: '', 
          frequency: '', 
          duration: '',
          instructions: '',
          refillsRemaining: 0
        });
        fetchPrescriptions(); // Refresh the list
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(id);
  }, [message]);

  function showMessage(type: 'success' | 'error' | 'info', text: string) {
    setMessage({ type, text });
  }

  const recent = useMemo(() => list.slice(0, 6), [list]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-e-prescription" isAuthenticated={true} userName={user?.name || 'Doctor'} />
      <div className="lg:pl-[280px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">E-Prescription</h1>
            <p className="text-gray-600">Create electronic prescriptions and review recent orders.</p>
          </div>
          <button 
            onClick={fetchPrescriptions}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow"
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
            <h2 className="text-lg font-semibold mb-4">New Prescription</h2>
            <form onSubmit={createPrescriptionHandler} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Patient *</label>
                <div className="space-y-2">
                  <input 
                    type="text"
                    value={patientSearch}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    placeholder="Search patient by name or email"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select 
                    value={form.patientId} 
                    onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} 
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Medication *</label>
                  <input 
                    value={form.medication} 
                    onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} 
                    placeholder="e.g., Amoxicillin" 
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Dosage *</label>
                  <input 
                    value={form.dosage} 
                    onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} 
                    placeholder="e.g., 500mg" 
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Frequency *</label>
                  <input 
                    value={form.frequency} 
                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} 
                    placeholder="e.g., 3 times daily" 
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duration</label>
                  <input 
                    value={form.duration} 
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} 
                    placeholder="e.g., 7 days" 
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Instructions</label>
                <textarea 
                  value={form.instructions} 
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} 
                  placeholder="Additional instructions for the patient" 
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Refills Remaining</label>
                <input 
                  type="number"
                  value={form.refillsRemaining} 
                  onChange={e => setForm(f => ({ ...f, refillsRemaining: parseInt(e.target.value) || 0 }))} 
                  placeholder="0" 
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      Creating...
                    </span>
                  ) : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Recent Prescriptions</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                </div>
              ) : recent.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recent.map(r => (
                    <div key={r._id} className="py-3">
                      <div className="font-semibold text-sm text-gray-900">
                        {r.patientId?.name || 'Unknown Patient'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(r.createdAt).toLocaleDateString()} • {r.medications.map(m => m.name).join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: <span className={`font-semibold ${
                          r.status === 'Dispensed' ? 'text-green-600' :
                          r.status === 'Pending' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No recent prescriptions
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      </div>
    </div>
  );
}
