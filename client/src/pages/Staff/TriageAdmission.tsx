import { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import triageDataRaw from '../../mockData/triageData.json';
import bedsDataRaw from '../../mockData/bedsData.json';
import { Clock, User } from 'lucide-react';

type TriageItem = typeof triageDataRaw[number];
type BedItem = typeof bedsDataRaw[number];

export default function TriageAdmission() {
  // language helper omitted here
  const [triage, setTriage] = useState<TriageItem[]>([]);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Queued' | 'Admitted-ER' | 'Admitted-Ward'>('All');
  const [selected, setSelected] = useState<TriageItem | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // clone mock data into state
    setTriage(JSON.parse(JSON.stringify(triageDataRaw)));
    setBeds(JSON.parse(JSON.stringify(bedsDataRaw)));
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  const filtered = useMemo(() => {
    if (filter === 'All') return triage;
    return triage.filter(t => t.admissionStatus === filter);
  }, [triage, filter]);

  function openAssign(item: TriageItem) {
    setSelected(item);
    setShowAssign(true);
  }

  function assignBed(bedNumber: string) {
    if (!selected) return;
    setTriage(prev => prev.map(p => p.triageId === selected.triageId ? { ...p, assignedBed: bedNumber, admissionStatus: 'Admitted-ER' } : p));
    setBeds(prev => prev.map(b => b.bedNumber === bedNumber ? { ...b, status: 'Occupied', currentPatient: selected.patientId } : b));
    setMessage(`Assigned bed ${bedNumber} to ${selected.name}`);
    setShowAssign(false);
    setSelected(null);
  }

  function admitToWard(item: TriageItem) {
    setTriage(prev => prev.map(p => p.triageId === item.triageId ? { ...p, admissionStatus: 'Admitted-Ward' } : p));
    setMessage(`${item.name} moved to ward`);
  }

  function releaseBed(item: TriageItem) {
    const bedNum = item.assignedBed;
    if (bedNum) {
      setBeds(prev => prev.map(b => b.bedNumber === bedNum ? { ...b, status: 'Vacant', currentPatient: null } : b));
    }
    setTriage(prev => prev.map(p => p.triageId === item.triageId ? { ...p, assignedBed: null, admissionStatus: 'Queued' } : p));
    setMessage(`${item.name} released from bed`);
  }

  const vacantBeds = beds.filter(b => b.status === 'Vacant');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff" isAuthenticated={true} userName={'Staff'} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Triage & Admission</h1>
            <p className="text-gray-600">Manage triage queue, assign beds and admit patients.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">Filter:</div>
            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="px-3 py-2 border rounded-lg">
              <option>All</option>
              <option>Queued</option>
              <option>Admitted-ER</option>
              <option>Admitted-Ward</option>
            </select>
          </div>
        </div>

        {message && (
          <div className="p-3 mb-4 text-green-800 border border-green-200 rounded-lg bg-green-50">{message}</div>
        )}

          <div className="grid gap-4 lg:grid-cols-3 sm:gap-6">
          <div className="p-6 shadow-xl lg:col-span-2 liquid-glass rounded-2xl">
            <h2 className="mb-4 text-lg font-semibold">Triage Queue</h2>
            <div className="space-y-4">
              {filtered.map(item => (
                <div key={item.triageId} className="flex flex-col p-4 border border-gray-200 rounded-lg sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name} <span className="text-sm text-gray-500">({item.age} yrs)</span></h3>
                        <div className="text-sm text-gray-600">{item.symptoms}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(item.createdAt).toLocaleString()}</div>
                      <div className="px-2 py-1 text-xs bg-gray-100 rounded-full">Severity: {item.severityLevel}</div>
                      <div className="px-2 py-1 text-xs rounded-full bg-blue-50">Status: {item.admissionStatus}</div>
                      {item.assignedBed && <div className="px-2 py-1 text-xs rounded-full bg-green-50">Bed: {item.assignedBed}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    {!item.assignedBed && (
                      <button onClick={() => openAssign(item)} className="px-3 py-2 text-white rounded-lg bg-gradient-to-r from-blue-600 to-green-600">Assign Bed</button>
                    )}
                    {item.assignedBed && item.admissionStatus !== 'Admitted-Ward' && (
                      <button onClick={() => admitToWard(item)} className="px-3 py-2 bg-white border rounded-lg">Move to Ward</button>
                    )}
                    {item.assignedBed && (
                      <button onClick={() => releaseBed(item)} className="px-3 py-2 text-red-600 border border-red-100 rounded-lg bg-red-50">Release Bed</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 shadow-xl liquid-glass rounded-2xl">
            <h2 className="mb-4 text-lg font-semibold">Beds Overview</h2>
            <div className="space-y-3">
              {beds.map(b => (
                <div key={b.bedNumber} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <div className="font-semibold">{b.bedNumber} <span className="text-sm text-gray-500">({b.ward})</span></div>
                    <div className="text-sm text-gray-600">Status: {b.status}{b.currentPatient ? ` — ${b.currentPatient}` : ''}</div>
                  </div>
                  <div>
                    {b.status === 'Vacant' ? (
                      <div className="text-sm text-green-600">Available</div>
                    ) : (
                      <div className="text-sm text-red-600">Occupied</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assign modal */}
        {showAssign && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-lg p-6 bg-white shadow-2xl rounded-2xl">
              <h3 className="mb-3 text-lg font-semibold">Assign Bed to {selected.name}</h3>
              <p className="mb-4 text-sm text-gray-600">Select a vacant bed from the list</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {vacantBeds.length > 0 ? vacantBeds.map(b => (
                  <button key={b.bedNumber} onClick={() => assignBed(b.bedNumber)} className="p-3 text-left border rounded-lg hover:shadow-md">
                    <div className="font-semibold">{b.bedNumber}</div>
                    <div className="text-sm text-gray-600">{b.ward}</div>
                  </button>
                )) : (
                  <div className="col-span-2 text-gray-500">No vacant beds available</div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowAssign(false); setSelected(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
