import { useState } from 'react';
import { Calendar, Search, Clock, User, Stethoscope, Filter, X } from 'lucide-react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import patientsData from '../../mockData/patientsData.json';
import doctorsData from '../../mockData/doctorsData.json';

export default function AppointmentPage() {
  const navigate = useNavigate();
  const currentPatient = patientsData[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const specializations = [...new Set(doctorsData.map(doc => doc.specialization))];

  const filteredDoctors = doctorsData.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    console.log('Booking confirmed:', {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      reason
    });
    setShowBookingModal(false);
    alert('Appointment booked successfully!');
    navigate('dashboard');
  };

  const availableTimesForDate = selectedDoctor?.availableSlots.find(
    (slot: any) => slot.date === selectedDate
  )?.times || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="appointments" isAuthenticated={true} userName={currentPatient.name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 lg:ml-[280px]">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Find and book appointments with our expert doctors</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.doctorId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                  Available
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
              <p className="text-blue-600 font-semibold mb-2 flex items-center">
                <Stethoscope className="h-4 w-4 mr-1" />
                {doctor.specialization}
              </p>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Department:</span> {doctor.department}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Experience:</span> {doctor.experience}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Qualification:</span> {doctor.qualification}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Next Available:</p>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  {doctor.availableSlots[0]?.date} at {doctor.availableSlots[0]?.times[0]}
                </div>
                <button
                  onClick={() => handleBookAppointment(doctor)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-gray-600">{selectedDoctor.name} - {selectedDoctor.specialization}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a date</option>
                  {selectedDoctor.availableSlots.map((slot: any) => (
                    <option key={slot.date} value={slot.date}>
                      {slot.date}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimesForDate.map((time: string) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedTime === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please describe your symptoms or reason for visit..."
                  required
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-semibold">Doctor:</span> {selectedDoctor.name}</p>
                  <p><span className="font-semibold">Specialization:</span> {selectedDoctor.specialization}</p>
                  <p><span className="font-semibold">Date:</span> {selectedDate || 'Not selected'}</p>
                  <p><span className="font-semibold">Time:</span> {selectedTime || 'Not selected'}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime || !reason}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
