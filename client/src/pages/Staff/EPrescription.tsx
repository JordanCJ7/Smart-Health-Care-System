import { useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import prescriptionsDataRaw from '../../mockData/prescriptionsData.json';
import patientsData from '../../mockData/patientsData.json';

type Prescription = typeof prescriptionsDataRaw[number];

export default function EPrescription() {
  const [list, setList] = useState<Prescription[]>(() => JSON.parse(JSON.stringify(prescriptionsDataRaw)));
  const [form, setForm] = useState({ patientId: patientsData[0].patientId, medication: '', dosage: '', frequency: '', duration: '' });

  function createPrescription(e: React.FormEvent) {
    e.preventDefault();
    const newRx: Prescription = {
      prescriptionId: `RX${Math.floor(Math.random() * 9000) + 1000}`,
      patientId: form.patientId,
      doctorName: 'Dr. You',
      date: new Date().toISOString().slice(0,10),
      medications: [{ name: form.medication, dosage: form.dosage, frequency: form.frequency, duration: form.duration, instructions: '' }],
      status: 'Active',
      refillsRemaining: 0
    } as Prescription;
    setList(prev => [newRx, ...prev]);
    setForm({ patientId: patientsData[0].patientId, medication: '', dosage: '', frequency: '', duration: '' });
  }

  const recent = useMemo(() => list.slice(0, 6), [list]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="staff-e-prescription" isAuthenticated={true} userName={'Dr. You'} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:ml-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">E-Prescription</h1>
            <p className="text-gray-600">Create electronic prescriptions and review recent orders.</p>
          </div>
        </div>

  <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">New Prescription</h2>
            <form onSubmit={createPrescription} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Patient</label>
                <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="w-full px-3 py-2 border rounded">
                  {patientsData.map(p => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} placeholder="Medication" className="px-3 py-2 border rounded" />
                <input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="Dosage" className="px-3 py-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} placeholder="Frequency" className="px-3 py-2 border rounded" />
                <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="Duration" className="px-3 py-2 border rounded" />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg">Create Prescription</button>
              </div>
            </form>
          </div>

          <aside className="liquid-glass shadow-xl rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Recent Prescriptions</h3>
              <div className="divide-y divide-gray-100">
                {recent.map(r => (
                  <div key={r.prescriptionId} className="py-3">
                    <div className="font-semibold text-sm text-gray-900">{r.prescriptionId} — {r.doctorName}</div>
                    <div className="text-xs text-gray-600">{r.date} • {r.medications.map(m => m.name).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
