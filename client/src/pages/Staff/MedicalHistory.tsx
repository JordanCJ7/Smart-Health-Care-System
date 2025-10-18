import { useEffect, useState, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import { Loader2, AlertCircle, Search, User, Calendar, FileText } from 'lucide-react';
import { 
  searchPatients, 
  getPatientMedicalHistory 
} from '../../services/medicalHistoryService';
import { useAuth } from '../../context/AuthContext';

interface Patient {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  bloodType?: string;
  gender?: string;
  phone?: string;
}

interface MedicalHistory {
  patient: Patient;
  appointments: any[];
  labOrders: any[];
  prescriptions: any[];
  triageRecords: any[];
}

export default function MedicalHistory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Visits' | 'Labs' | 'Prescriptions'>('All');

  const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // Load all patients on component mount
  useEffect(() => {
    const loadAllPatients = async () => {
      setInitialLoading(true);
      try {
        console.log('Loading all patients...');
        const response = await searchPatients('');
        console.log('All patients response:', response);
        if (response.success) {
          const allPatients = response.data?.users || [];
          console.log('All patients loaded:', allPatients.length);
          setPatients(allPatients);
          if (allPatients.length === 0) {
            showMessage('info', 'No patients found in the system');
          }
        } else {
          showMessage('error', response.error || 'Failed to load patients');
        }
      } catch (error: any) {
        console.error('Load all patients error:', error);
        showMessage('error', error.message || 'Failed to load patients');
      } finally {
        setInitialLoading(false);
      }
    };

    loadAllPatients();
  }, [showMessage]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length === 0) {
      // If search is cleared, show all patients
      try {
        console.log('Clearing search, loading all patients...');
        const response = await searchPatients('');
        if (response.success) {
          setPatients(response.data?.users || []);
        }
      } catch (error) {
        console.error('Error loading all patients:', error);
      }
      return;
    }

    if (query.length < 2) {
      return;
    }
    
    setSearching(true);
    try {
      console.log('Searching for patients:', query);
      const response = await searchPatients(query);
      console.log('Search response:', response);
      if (response.success) {
        const foundPatients = response.data?.users || [];
        console.log('Found patients:', foundPatients);
        setPatients(foundPatients);
        if (foundPatients.length === 0) {
          showMessage('info', 'No patients found');
        }
      } else {
        showMessage('error', response.error || 'Failed to search patients');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      showMessage('error', error.message || 'Failed to search patients');
    } finally {
      setSearching(false);
    }
  }, [showMessage]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, handleSearch]);

  const selectPatient = useCallback(async (patient: Patient) => {
    setSelectedPatient(patient);
    // Don't clear the patients list - keep it visible!
    setLoading(true);
    
    try {
      console.log('Loading medical history for patient:', patient._id);
      const response = await getPatientMedicalHistory(patient._id);
      console.log('Medical history response:', response);
      if (response.success) {
        const { patient: patientData, medicalHistory: historyData } = response.data;
        console.log('Patient data:', patientData);
        console.log('History data:', historyData);
        setMedicalHistory({
          patient: patientData,
          appointments: historyData.appointments || [],
          labOrders: historyData.labOrders || [],
          prescriptions: historyData.prescriptions || [],
          triageRecords: historyData.triageRecords || []
        });
        showMessage('success', `Loaded medical history for ${patientData.name}`);
      } else {
        showMessage('error', response.error || 'Failed to fetch medical history');
      }
    } catch (error: any) {
      console.error('Medical history error:', error);
      showMessage('error', error.message || 'Failed to fetch medical history');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Function to clear the selected patient and reset UI
  const clearSelectedPatient = useCallback(() => {
    setSelectedPatient(null);
    setMedicalHistory(null);
    setSearchQuery('');
  }, []);

  const getFilteredHistory = () => {
    if (!medicalHistory) return [];
    
    let items: any[] = [];
    
    if (filterType === 'All' || filterType === 'Visits') {
      items = items.concat(
        medicalHistory.appointments.map(a => ({
          ...a,
          type: 'Visit',
          date: a.date,
          title: `Appointment with Dr. ${a.doctorId?.name || 'Unknown'}`,
          description: a.reason || 'General checkup'
        }))
      );
    }
    
    if (filterType === 'All' || filterType === 'Labs') {
      items = items.concat(
        medicalHistory.labOrders.map(l => ({
          ...l,
          type: 'Lab',
          date: l.createdAt,
          title: l.testType,
          description: `Status: ${l.status}${l.results ? ' - Results available' : ''}`
        }))
      );
    }
    
    if (filterType === 'All' || filterType === 'Prescriptions') {
      items = items.concat(
        medicalHistory.prescriptions.map(p => ({
          ...p,
          type: 'Prescription',
          date: p.createdAt,
          title: p.medications.map((m: any) => m.name).join(', '),
          description: `Prescribed by Dr. ${p.doctorId?.name || 'Unknown'}`
        }))
      );
    }
    
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-medical-history" isAuthenticated={true} userName={user?.name || 'Staff'} />
      <div className="lg:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical History</h1>
            <p className="text-gray-600 mt-1">Access patient medical history and encounter notes.</p>
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

          {/* Two-column layout: Patient List on left, Medical History on right */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Patient Selection Panel - Left Column */}
            <div className="lg:col-span-1">
              <div className="liquid-glass rounded-2xl p-4 shadow-xl sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Patients</h2>
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searching && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-blue-600" />}
                </div>

                {/* Patient List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {initialLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                    </div>
                  ) : patients.length > 0 ? (
                    <>
                      <div className="sticky top-0 text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded border-b">
                        {patients.length} patient{patients.length === 1 ? '' : 's'}
                        {searchQuery && ` matching "${searchQuery}"`}
                      </div>
                      {patients.map(patient => (
                        <button
                          key={patient._id}
                          onClick={() => selectPatient(patient)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                            selectedPatient?._id === patient._id
                              ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-900 font-semibold'
                              : 'hover:bg-gray-100 border-l-4 border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-xs opacity-75 line-clamp-1">{patient.email}</div>
                          {patient.dateOfBirth && (
                            <div className="text-xs opacity-60">
                              {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </div>
                          )}
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No patients found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical History Display - Right 3 Columns */}
            {selectedPatient && medicalHistory ? (
              <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                <div className="liquid-glass shadow-xl rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{medicalHistory.patient.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">{medicalHistory.patient.email}</p>
                    </div>
                    <button
                      onClick={clearSelectedPatient}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <div className="liquid-glass shadow-xl rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">History Timeline</h3>
                        <div className="flex items-center gap-2">
                          <select 
                            className="px-3 py-2 border rounded-lg text-sm"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                          >
                            <option>All</option>
                            <option>Visits</option>
                            <option>Labs</option>
                            <option>Prescriptions</option>
                          </select>
                        </div>
                      </div>
                      
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getFilteredHistory().length > 0 ? (
                            getFilteredHistory().map((item, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              item.type === 'Visit' ? 'bg-blue-50 text-blue-700' :
                              item.type === 'Lab' ? 'bg-green-50 text-green-700' :
                              'bg-purple-50 text-purple-700'
                            }`}>
                              {item.type}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        No medical history records found for this patient.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {medicalHistory.triageRecords && medicalHistory.triageRecords.length > 0 && (
                <div className="liquid-glass shadow-xl rounded-2xl p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Triage Records</h2>
                  <div className="space-y-3">
                    {medicalHistory.triageRecords.slice(0, 3).map((record: any, idx: number) => (
                      <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                        <div className="font-semibold text-sm">
                          Severity: <span className={`${
                            record.severityLevel === 'Critical' ? 'text-red-600' :
                            record.severityLevel === 'Stable' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>{record.severityLevel}</span>
                        </div>
                        {record.vitals && (
                          <div className="text-xs text-gray-600 mt-1">
                            BP: {record.vitals.bloodPressure || 'N/A'} | 
                            HR: {record.vitals.heartRate || 'N/A'} | 
                            Temp: {record.vitals.temperature || 'N/A'}°F
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="liquid-glass shadow-xl rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">Name</div>
                  <div className="font-semibold text-gray-900">{medicalHistory.patient.name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">Email</div>
                  <div className="font-semibold text-gray-900 text-xs">{medicalHistory.patient.email}</div>
                </div>
                {medicalHistory.patient.dateOfBirth && (
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600">DOB</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(medicalHistory.patient.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {medicalHistory.patient.bloodType && (
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600">Blood Type</div>
                    <div className="font-semibold text-gray-900">{medicalHistory.patient.bloodType}</div>
                  </div>
                )}
                {medicalHistory.patient.gender && (
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600">Gender</div>
                    <div className="font-semibold text-gray-900">{medicalHistory.patient.gender}</div>
                  </div>
                )}
                {medicalHistory.patient.phone && (
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600">Phone</div>
                    <div className="font-semibold text-gray-900 text-xs">{medicalHistory.patient.phone}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointments</span>
                    <span className="font-semibold">{medicalHistory.appointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lab Orders</span>
                    <span className="font-semibold">{medicalHistory.labOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prescriptions</span>
                    <span className="font-semibold">{medicalHistory.prescriptions.length}</span>
                  </div>
                </div>
              </div>
            </aside>
                    </div>
                  </div>
            ) : (
              <div className="lg:col-span-3">
                <div className="liquid-glass rounded-2xl p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patient Selected</h3>
                  <p className="text-gray-600">
                    Search for a patient on the left to view their medical history
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
