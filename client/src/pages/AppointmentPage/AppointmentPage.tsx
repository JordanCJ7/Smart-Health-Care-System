import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, User, Stethoscope, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { getAvailableSlots, holdSlot, releaseSlot } from '../../services/scheduleService';
import { createAppointment } from '../../services/appointmentService';

interface SlotObject {
  time: string;
  status: string;
  _id: string;
}

interface DoctorSlot {
  _id: string;
  doctorId?: {
    _id: string;
    name: string;
    specialization?: string;
    department?: string;
  } | null;
  date: string;
  availableSlots: SlotObject[];
}

export default function AppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [heldSlot, setHeldSlot] = useState<{ scheduleId: string; time: string } | null>(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedSpecialization]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (selectedSpecialization) {
        filters.specialization = selectedSpecialization;
      }
      
      const response = await getAvailableSlots(filters);
      if (response.success && Array.isArray(response.data)) {
        // Filter out any slots with null or invalid doctorId
        const validSlots = response.data.filter((slot: any) => 
          slot && slot.doctorId && slot.doctorId._id
        );
        setSlots(validSlots);
      } else {
        setSlots([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load available slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [...new Set(
    slots
      .filter((s): s is DoctorSlot & { doctorId: NonNullable<DoctorSlot['doctorId']> } => 
        !!s.doctorId && !!s.doctorId.specialization
      )
      .map(s => s.doctorId!.specialization!)
      .filter(Boolean) // Remove any null/undefined values
  )];

  const filteredSlots = slots.filter(slot => {
    // Skip slots with null or undefined doctorId
    if (!slot.doctorId || !slot.doctorId._id) return false;
    
    const doctorName = slot.doctorId.name?.toLowerCase() || '';
    const spec = slot.doctorId.specialization?.toLowerCase() || '';
    const matchesSearch = doctorName.includes(searchTerm.toLowerCase()) || spec.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleBookAppointment = async (slot: any) => {
    // Store the full slot object with doctor info and dates
    setSelectedDoctor({
      ...slot.doctorId,
      availableSlots: groupedSlots[slot.doctorId._id]?.dates || []
    });
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setShowBookingModal(true);
  };

  const handleTimeSelection = async (time: string) => {
    if (selectedTime === time) {
      // Deselect
      if (heldSlot) {
        try {
          await releaseSlot(heldSlot.scheduleId, heldSlot.time);
          setHeldSlot(null);
        } catch (err) {
          console.error('Failed to release slot:', err);
        }
      }
      setSelectedTime('');
      return;
    }

    // Release previous hold if any
    if (heldSlot) {
      try {
        await releaseSlot(heldSlot.scheduleId, heldSlot.time);
      } catch (err) {
        console.error('Failed to release previous slot:', err);
      }
    }

    // Hold new slot
    const scheduleSlot = slots.find(s => s.doctorId._id === selectedDoctor._id && s.date === selectedDate);
    if (scheduleSlot) {
      try {
        await holdSlot({ scheduleId: scheduleSlot._id, time });
        setHeldSlot({ scheduleId: scheduleSlot._id, time });
        setSelectedTime(time);
      } catch (err: any) {
        setError(err.message || 'Failed to hold slot');
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) {
      setError('Please fill in all fields');
      return;
    }

    setActionLoading(true);
    try {
      const scheduleSlot = slots.find(s => s.doctorId._id === selectedDoctor._id && s.date === selectedDate);
      
      await createAppointment({
        doctorId: selectedDoctor._id,
        date: selectedDate,
        time: selectedTime,
        reason,
        scheduleId: scheduleSlot?._id,
      });

      setShowBookingModal(false);
      alert('Appointment booked successfully!');
      navigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = async () => {
    if (heldSlot) {
      try {
        await releaseSlot(heldSlot.scheduleId, heldSlot.time);
        setHeldSlot(null);
      } catch (err) {
        console.error('Failed to release slot on close:', err);
      }
    }
    setShowBookingModal(false);
  };

  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const doctorId = slot.doctorId._id;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctor: slot.doctorId,
        dates: []
      };
    }
    acc[doctorId].dates.push({ date: slot.date, times: slot.availableSlots, scheduleId: slot._id });
    return acc;
  }, {} as Record<string, any>);

  // Get available times for selected date
  const availableTimesForDate = (() => {
    if (!selectedDoctor || !selectedDate) return [];
    
    const dateSlot = groupedSlots[selectedDoctor._id]?.dates.find((d: any) => d.date === selectedDate);
    if (!dateSlot || !dateSlot.times) return [];
    
    return dateSlot.times
      .map((slot: any) => {
        // Handle both string times and slot objects
        if (typeof slot === 'string') return slot;
        if (typeof slot === 'object' && slot && slot.time) return slot.time;
        return null;
      })
      .filter((time: string | null): time is string => time !== null && time !== undefined);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="appointments" isAuthenticated={true} userName={user?.name || 'User'} />

      <div className="lg:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
            <p className="text-gray-600">Find and book appointments with our expert doctors</p>
          </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(groupedSlots).map((item: any) => {
              const doctor = item.doctor;
              const nextSlot = item.dates[0];
              
              return (
                <div key={doctor._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6">
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
                    {doctor.specialization || 'General'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Department:</span> {doctor.department || 'N/A'}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Next Available:</p>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      {new Date(nextSlot.date).toLocaleDateString()} at {
                        typeof nextSlot.times[0] === 'string' 
                          ? nextSlot.times[0] 
                          : nextSlot.times[0]?.time || 'N/A'
                      }
                    </div>
                    <button
                      onClick={() => handleBookAppointment({ ...nextSlot, doctorId: doctor })}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
            {Object.keys(groupedSlots).length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No available slots found. Try adjusting your search filters.
              </div>
            )}
          </div>
        )}
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
                onClick={handleCloseModal}
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
                  {selectedDoctor.availableSlots && selectedDoctor.availableSlots.map((dateSlot: any) => (
                    <option key={dateSlot.date} value={dateSlot.date}>
                      {new Date(dateSlot.date).toLocaleDateString()}
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
    </div>
  );
}
