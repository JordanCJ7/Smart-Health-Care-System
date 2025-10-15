import { CreditCard, User, Calendar, Droplet, Phone, MapPin, Users, Shield, FileText, Pill, Activity } from 'lucide-react';
import Navigation from '../../components/Navigation';
import patientsData from '../../mockData/patientsData.json';
import appointmentsData from '../../mockData/appointmentsData.json';
import labResultsData from '../../mockData/labResultsData.json';
import prescriptionsData from '../../mockData/prescriptionsData.json';

export default function DigitalHealthCard() {
  const currentPatient = patientsData[0];
  const patientAppointments = appointmentsData.filter(apt => apt.patientId === currentPatient.patientId);
  const patientLabResults = labResultsData.filter(lab => lab.patientId === currentPatient.patientId);
  const patientPrescriptions = prescriptionsData.filter(rx => rx.patientId === currentPatient.patientId);

  const recentAppointments = patientAppointments.slice(0, 3);
  const recentLabResults = patientLabResults.slice(0, 3);
  const activePrescriptions = patientPrescriptions.filter(rx => rx.status === 'Active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="health-card" isAuthenticated={true} userName={currentPatient.name} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 lg:ml-[280px]">
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Health Card</h1>
          <p className="text-gray-600">Your comprehensive health information in one place</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">HealthCare+ Member</p>
              <h2 className="text-3xl font-bold mb-1">{currentPatient.name}</h2>
              <p className="text-blue-100">Patient ID: {currentPatient.patientId}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <User className="h-12 w-12" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5" />
                <p className="text-sm opacity-90">Date of Birth</p>
              </div>
              <p className="text-lg font-semibold">{currentPatient.dateOfBirth}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Droplet className="h-5 w-5" />
                <p className="text-sm opacity-90">Blood Type</p>
              </div>
              <p className="text-lg font-semibold">{currentPatient.bloodType}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5" />
                <p className="text-sm opacity-90">Gender</p>
              </div>
              <p className="text-lg font-semibold">{currentPatient.gender}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Phone className="h-6 w-6 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{currentPatient.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{currentPatient.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{currentPatient.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-green-600" />
              Emergency Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{currentPatient.emergencyContact.name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-semibold text-gray-900">{currentPatient.emergencyContact.relationship}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{currentPatient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-purple-600" />
            Insurance Information
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Provider</p>
              <p className="font-semibold text-gray-900">{currentPatient.insurance.provider}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Policy Number</p>
              <p className="font-semibold text-gray-900">{currentPatient.insurance.policyNumber}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Group Number</p>
              <p className="font-semibold text-gray-900">{currentPatient.insurance.groupNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Activity className="h-10 w-10 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold text-gray-900">{patientAppointments.length}</p>
            <p className="text-gray-600">Total Appointments</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FileText className="h-10 w-10 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold text-gray-900">{patientLabResults.length}</p>
            <p className="text-gray-600">Lab Results</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Pill className="h-10 w-10 mx-auto mb-2 text-purple-600" />
            <p className="text-3xl font-bold text-gray-900">{activePrescriptions.length}</p>
            <p className="text-gray-600">Active Prescriptions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Recent Appointments
          </h3>
          {recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {recentAppointments.map(apt => (
                <div key={apt.appointmentId} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{apt.doctorName}</p>
                    <p className="text-sm text-gray-600">{apt.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{apt.date}</p>
                    <p className="text-sm text-gray-600">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No appointments recorded</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-green-600" />
              Recent Lab Results
            </h3>
            {recentLabResults.length > 0 ? (
              <div className="space-y-3">
                {recentLabResults.map(lab => (
                  <div key={lab.resultId} className="p-4 bg-green-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{lab.testName}</p>
                    <p className="text-sm text-gray-600">Result Date: {lab.resultDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No lab results available</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Pill className="h-6 w-6 mr-2 text-purple-600" />
              Active Medications
            </h3>
            {activePrescriptions.length > 0 ? (
              <div className="space-y-3">
                {activePrescriptions.map(rx => (
                  <div key={rx.prescriptionId} className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-semibold text-gray-900">Prescribed by {rx.doctorName}</p>
                    {rx.medications.map((med, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        {med.name} - {med.dosage}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No active prescriptions</p>
            )}
          </div>
        </div>

        <div className="mt-8 bg-orange-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">About Your Digital Health Card</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• This digital health card contains your essential medical information</li>
            <li>• Keep this information updated for accurate medical care</li>
            <li>• You can share this card with healthcare providers when needed</li>
            <li>• All information is securely stored and encrypted</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
