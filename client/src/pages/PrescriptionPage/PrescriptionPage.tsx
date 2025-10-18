import { Pill, User, Calendar, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import * as prescriptionService from '../../services/prescriptionService';

export default function PrescriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const response = await prescriptionService.getPatientPrescriptions(user._id);
        
        if (response.success && response.data) {
          setPatientPrescriptions(response.data);
        } else {
          setError('Failed to load prescriptions');
        }
      } catch (err: any) {
        console.error('Error fetching prescriptions:', err);
        setError(err.message || 'Failed to load prescriptions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  const activePrescriptions = patientPrescriptions.filter(rx => 
    rx.status === 'Pending' || rx.status === 'Active' || rx.status === 'Dispensed'
  );
  const completedPrescriptions = patientPrescriptions.filter(rx => 
    rx.status === 'Completed' || rx.status === 'Expired'
  );

  const handleRequestRefill = (prescriptionId: string) => {
    console.log('Requesting refill for:', prescriptionId);
    alert('Refill request submitted successfully! You will be notified once approved.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="prescriptions" isAuthenticated={true} userName={user?.name || 'User'} />

      <div className="lg:pl-[280px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
          <div className="text-center mb-8">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
            <p className="text-gray-600">View and manage your prescribed medications</p>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error Loading Prescriptions</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading your prescriptions...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Pill className="h-10 w-10 mx-auto mb-2 text-purple-600" />
                <p className="text-3xl font-bold text-gray-900">{patientPrescriptions.length}</p>
                <p className="text-gray-600">Total Prescriptions</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold text-gray-900">{activePrescriptions.length}</p>
                <p className="text-gray-600">Active</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                <p className="text-3xl font-bold text-gray-900">{completedPrescriptions.length}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>

        {activePrescriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              Active Prescriptions
            </h2>
            <div className="space-y-4">
              {activePrescriptions.map(prescription => (
                <div key={prescription._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Prescription #{prescription._id.slice(-6)}
                        </h3>
                        <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                          prescription.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          prescription.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Prescribed by: {prescription.doctorId?.name || 'Doctor'}
                        </p>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date: {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Refills Remaining</p>
                      <p className="text-2xl font-bold text-purple-600">{prescription.refillsRemaining || 0}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Medications</h4>
                    <div className="space-y-4">
                      {prescription.medications.map((med: any, idx: number) => (
                        <div key={idx} className="bg-purple-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-bold text-gray-900 text-lg">{med.name}</h5>
                              <p className="text-gray-600">{med.dosage}</p>
                            </div>
                            <Pill className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                            <div>
                              <p className="font-semibold text-gray-700">Frequency</p>
                              <p>{med.frequency}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Duration</p>
                              <p>{med.duration}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <div className="mt-3 bg-white rounded p-3">
                              <p className="font-semibold text-gray-700 text-sm mb-1">Instructions</p>
                              <p className="text-gray-600 text-sm">{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div className="mb-4 bg-blue-50 border-l-4 border-blue-600 p-4">
                      <p className="font-semibold text-blue-900 mb-1">Pharmacist Notes</p>
                      <p className="text-blue-800 text-sm">{prescription.notes}</p>
                    </div>
                  )}

                  {(prescription.refillsRemaining || 0) > 0 && (
                    <button
                      onClick={() => handleRequestRefill(prescription._id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span>Request Refill</span>
                    </button>
                  )}

                  {(prescription.refillsRemaining || 0) === 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-600 p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                        <p className="text-orange-800 font-semibold">No refills remaining</p>
                      </div>
                      <p className="text-orange-700 text-sm mt-1">
                        Please contact your doctor to request a new prescription.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {completedPrescriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-gray-600" />
              Completed Prescriptions
            </h2>
            <div className="space-y-4">
              {completedPrescriptions.map(prescription => (
                <div key={prescription._id} className="bg-white rounded-xl shadow-lg p-6 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Prescription #{prescription._id.slice(-6)}
                        </h3>
                        <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full font-semibold">
                          {prescription.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Prescribed by: {prescription.doctorId?.name || 'Doctor'}
                        </p>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date: {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Medications</h4>
                    <div className="space-y-2">
                      {prescription.medications.map((med: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="font-semibold text-gray-900">{med.name} - {med.dosage}</p>
                            <p className="text-sm text-gray-600">{med.frequency}{med.duration ? ` for ${med.duration}` : ''}</p>
                          </div>
                          <Pill className="h-5 w-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {patientPrescriptions.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Pill className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescriptions</h3>
            <p className="text-gray-600 mb-6">You don't have any prescriptions yet.</p>
            <button
              onClick={() => navigate('appointments')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Book an Appointment
            </button>
          </div>
        )}

        <div className="mt-8 bg-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Important Medication Safety Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Always take medications exactly as prescribed by your doctor</li>
            <li>• Never share your medications with others</li>
            <li>• Store medications in a cool, dry place away from direct sunlight</li>
            <li>• Check expiration dates regularly and dispose of expired medications properly</li>
            <li>• Contact your doctor if you experience any side effects or allergic reactions</li>
            <li>• Request refills at least 3-5 days before running out of medication</li>
          </ul>
        </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
