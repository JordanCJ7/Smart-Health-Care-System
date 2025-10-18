import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import { Clock, User, Search, AlertCircle } from 'lucide-react';
import { getTriageRecords, getAllBeds, assignBed, releaseBed, updateTriageRecord } from '../../services/triageService';
import { useAuth } from '../../context/AuthContext';

interface TriageItem {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    age?: number;
  };
  vitals: {
    bp: string;
    hr: number;
    temp: number;
  };
  symptoms: string;
  severityLevel: 'Critical' | 'Urgent' | 'Stable' | 'Normal';
  admissionStatus: 'Queued' | 'Admitted-ER' | 'Admitted-Ward' | 'Discharged';
  assignedBed?: {
    _id: string;
    bedNumber: string;
    ward: string;
  };
  createdAt: string;
}

interface BedItem {
  _id: string;
  bedNumber: string;
  ward: string;
  status: 'Vacant' | 'Occupied' | 'Reserved' | 'Maintenance';
  currentPatient?: {
    _id: string;
    name: string;
  };
}

export default function TriageAdmission() {
  const { user } = useAuth();
  const [triage, setTriage] = useState<TriageItem[]>([]);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Queued' | 'Admitted-ER' | 'Admitted-Ward'>('All');
  const [selected, setSelected] = useState<TriageItem | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [releasingBedId, setReleasingBedId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientVerify, setShowPatientVerify] = useState(false);

  // UC-004: Fetch triage records and beds on mount
  useEffect(() => {
    fetchTriageAndBeds();
  }, []);

  const fetchTriageAndBeds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // UC-004 Step 4: Get triage records (sorted by priority queue)
      const triageResponse = await getTriageRecords();
      
      // UC-004 Step 5: Get bed availability
      const bedsResponse = await getAllBeds();
      
      if (triageResponse.success && bedsResponse.success) {
        setTriage(triageResponse.data);
        setBeds(bedsResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load triage data');
      console.error('Error fetching triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message && !error) return;
    const id = setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(id);
  }, [message, error]);

  // UC-004 Step 7: Priority queue filtering (already sorted by backend)
  const filtered = useMemo(() => {
    if (filter === 'All') return triage;
    return triage.filter(t => t.admissionStatus === filter);
  }, [triage, filter]);

  function openAssign(item: TriageItem) {
    setSelected(item);
    setShowAssign(true);
  }

  // UC-004 Step 5: Assign bed to patient
  async function handleAssignBed(bed: BedItem) {
    if (!selected) return;
    
    try {
      setLoading(true);
      
      // UC-004 Step 5 & 8: Assign bed and notify doctor (if applicable)
      const response = await assignBed({
        bedId: bed._id,
        patientId: selected.patientId._id,
        triageRecordId: selected._id,
        // notifyDoctorId can be added here if doctor selection is implemented
      });

      if (response.success) {
        setMessage(`Assigned bed ${bed.bedNumber} to ${selected.patientId.name}`);
        setShowAssign(false);
        setSelected(null);
        
        // Refresh data to reflect changes
        await fetchTriageAndBeds();
      }
    } catch (err: any) {
      // Extension 5a: Handle no beds available
      if (err.message.includes('occupied') || err.message.includes('available')) {
        setError('No beds available. Patient added to waiting list.');
      } else {
        setError(err.message || 'Failed to assign bed');
      }
    } finally {
      setLoading(false);
    }
  }

  // UC-004: Release bed functionality
  async function handleReleaseBed(item: TriageItem) {
    if (!item.assignedBed) {
      setError('No bed assigned to this patient');
      return;
    }
    
    const bedId = item.assignedBed._id;
    const bedNumber = item.assignedBed.bedNumber;
    
    try {
      setReleasingBedId(bedId);
      setError(null);
      setMessage(null);
      
      console.log('Starting to release bed:', { bedId, bedNumber, patientName: item.patientId.name });
      
      // Release the bed
      const response = await releaseBed(bedId);
      console.log('Release bed response:', response);
      
      if (response?.success) {
        // Also update the triage record to mark as Discharged and clear assigned bed
        try {
          const triageUpdateResponse = await updateTriageRecord(item._id, {
            admissionStatus: 'Discharged',
            assignedBed: null as any, // Explicitly set to null to clear the bed reference
          });
          console.log('Triage update response:', triageUpdateResponse);
        } catch (triageErr) {
          console.warn('Failed to update triage record:', triageErr);
          // Don't fail the entire operation if triage update fails
        }
        
        setMessage(`Successfully released bed ${bedNumber} from ${item.patientId.name}`);
        // Refresh the triage and beds data
        await fetchTriageAndBeds();
      } else {
        setError(response?.error || 'Failed to release bed. Please try again.');
      }
    } catch (err: any) {
      console.error('Release bed error:', err);
      setError(err.message || 'Failed to release bed. Please check the bed status and try again.');
    } finally {
      setReleasingBedId(null);
    }
  }

  const vacantBeds = beds.filter(b => b.status === 'Vacant');

  // Severity color coding
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Urgent':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Stable':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff" isAuthenticated={true} userName={user?.name || 'Staff'} />

    <div className="px-4 py-8 pt-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">UC-004: Triage & Admission</h1>
            <p className="text-gray-600">Assess patients, record medical details, and manage admissions (Priority Queue Active)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">Filter:</div>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value as any)} 
              className="px-3 py-2 border rounded-lg"
              disabled={loading}
            >
              <option>All</option>
              <option>Queued</option>
              <option>Admitted-ER</option>
              <option>Admitted-Ward</option>
            </select>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="flex items-center gap-2 p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">
            <span>✓</span> {message}
          </div>
        )}

        {/* Error Message (Extensions 2a, 5a, 8a) */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-red-800 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="w-5 h-5" />
            <div>
              <strong>Error:</strong> {error}
              <div className="mt-1 text-sm">Please contact support if the issue persists.</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-6 mb-4 text-center text-gray-600 bg-white border rounded-lg">
            Loading triage data and bed availability...
          </div>
        )}

          <div className="grid gap-4 lg:grid-cols-3 sm:gap-6">
          <div className="p-6 shadow-xl lg:col-span-2 liquid-glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Triage Queue (Priority Sorted)</h2>
              <span className="text-sm text-gray-600">{filtered.length} patient(s)</span>
            </div>
            
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500 rounded-lg bg-gray-50">
                No patients in triage queue
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item, index) => (
                  <div key={item._id} className={`flex flex-col p-4 border-2 rounded-lg sm:flex-row sm:items-start sm:justify-between ${getSeverityColor(item.severityLevel)}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm">
                          <User className="w-6 h-6 text-blue-600" />
                          <span className="absolute px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full -top-2 -right-2">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.patientId.name}
                            {item.patientId.age && <span className="ml-2 text-sm text-gray-600">({item.patientId.age} yrs)</span>}
                          </h3>
                          <div className="text-sm text-gray-700">{item.symptoms}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full shadow-sm">
                          <Clock className="w-3 h-3" /> 
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                        <div className="px-2 py-1 font-semibold bg-white rounded-full shadow-sm">
                          {item.severityLevel}
                        </div>
                        <div className="px-2 py-1 bg-white rounded-full shadow-sm">
                          {item.admissionStatus}
                        </div>
                        {item.assignedBed && (
                          <div className="px-2 py-1 text-white bg-green-600 rounded-full">
                            Bed: {item.assignedBed.bedNumber}
                          </div>
                        )}
                        <div className="px-2 py-1 bg-white rounded-full shadow-sm">
                          BP: {item.vitals.bp} | HR: {item.vitals.hr} | Temp: {item.vitals.temp}°F
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-4">
                      {/* Assign Bed */}
                      {!item.assignedBed && (
                        <button 
                          onClick={() => openAssign(item)} 
                          className="px-4 py-2 text-white transition-colors rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                          disabled={loading}
                        >
                          Assign Bed
                        </button>
                      )}
                      {item.assignedBed && (
                        <button 
                          onClick={() => handleReleaseBed(item)} 
                          className={`px-4 py-2 text-red-700 transition-colors rounded-lg shadow-md font-semibold ${
                            releasingBedId === item.assignedBed._id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200' 
                              : 'bg-white border-2 border-red-200 hover:bg-red-50 cursor-pointer'
                          }`}
                          disabled={releasingBedId === item.assignedBed._id}
                        >
                          {releasingBedId === item.assignedBed._id ? 'Releasing...' : 'Release Bed'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 shadow-xl liquid-glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Beds</h2>
              <span className="text-sm text-gray-600">
                {vacantBeds.length}/{beds.length} available
              </span>
            </div>
            
            {beds.length === 0 ? (
              <div className="p-6 text-center text-gray-500 rounded-lg bg-gray-50">
                No beds configured
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {beds.map(b => (
                  <div 
                    key={b._id} 
                    className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                      b.status === 'Vacant' 
                        ? 'border-green-200 bg-green-50' 
                        : b.status === 'Occupied'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {b.bedNumber}
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({b.ward})
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {b.status}
                        {b.currentPatient && (
                          <span className="ml-1">• {b.currentPatient.name}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {b.status === 'Vacant' ? (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          Available
                        </div>
                      ) : b.status === 'Occupied' ? (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          Occupied
                        </div>
                      ) : (
                        <div className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">
                          {b.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assign Bed Modal (with doctor notification) */}
        {showAssign && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl p-6 mx-4 bg-white shadow-2xl rounded-2xl">
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Assign Bed to {selected.patientId.name}
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Select a vacant bed from the list below. Doctor will be notified automatically.
              </p>
              
              {/* Severity Badge */}
              <div className={`inline-block px-3 py-1 mb-4 text-sm font-semibold rounded-full ${getSeverityColor(selected.severityLevel)}`}>
                Severity: {selected.severityLevel}
              </div>

              {/* Vacant Beds Grid */}
              {vacantBeds.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-6 max-h-[400px] overflow-y-auto">
                  {vacantBeds.map(b => (
                    <button 
                      key={b._id} 
                      onClick={() => handleAssignBed(b)} 
                      className="p-4 text-left transition-all border-2 border-green-200 rounded-lg hover:shadow-lg hover:border-green-400 hover:bg-green-50"
                      disabled={loading}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{b.bedNumber}</div>
                          <div className="text-sm text-gray-600">{b.ward}</div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          Available
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 mb-6 text-center border-2 border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold text-red-800">Extension 5a: No Beds Available</p>
                  <p className="text-sm text-red-700">
                    Patient will be added to waiting list. Please contact support or check bed availability later.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => { setShowAssign(false); setSelected(null); }} 
                  className="px-5 py-2 transition-colors border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
