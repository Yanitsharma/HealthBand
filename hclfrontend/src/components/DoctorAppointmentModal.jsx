import { useState, useEffect } from 'react';
import Modal from './Modal';
import { appointmentsAPI } from '../utils/api';
import './DoctorAppointmentModal.css';

function DoctorAppointmentModal({ isOpen, onClose, onBookAppointment }) {
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Time, 3: Confirm
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [reason, setReason] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [booking, setBooking] = useState(false);
  
  // API data states
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError('');
      
      const params = {};
      if (specialtyFilter !== 'All') {
        params.specialty = specialtyFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await appointmentsAPI.getDoctors(params);
      
      if (response.success) {
        setDoctors(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch doctor availability
  const fetchAvailability = async (doctorId, date) => {
    try {
      setLoadingSlots(true);
      setError('');
      
      const response = await appointmentsAPI.getDoctorAvailability(doctorId, date);
      
      if (response.success && response.data) {
        setAvailableSlots(response.data.availableSlots || []);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load available time slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedTime('');
      setSelectedSlotId('');
      setReason('');
      setPatientNotes('');
      setSearchTerm('');
      setSpecialtyFilter('All');
      setAvailableSlots([]);
      setError('');
      fetchDoctors(); // Fetch doctors when modal opens
    }
  }, [isOpen]);

  // Fetch doctors when filters change
  useEffect(() => {
    if (isOpen && step === 1) {
      const debounceTimer = setTimeout(() => {
        fetchDoctors();
      }, 300); // Debounce search
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, specialtyFilter, isOpen, step]);

  // Get unique specialties from doctors
  const specialties = ['All', ...new Set(doctors.map(doc => doc.specialty))];

  // Filtered doctors (already filtered by API, but keep for consistency)
  const filteredDoctors = doctors;

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTime('');
    setSelectedSlotId('');
    setStep(2);
    
    // Fetch availability for the selected doctor and default date
    await fetchAvailability(doctor.id, selectedDate);
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot.time);
    setSelectedSlotId(slot.slotId);
  };

  // Handle date change - refetch availability
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    setSelectedTime('');
    setSelectedSlotId('');
    
    if (selectedDoctor) {
      await fetchAvailability(selectedDoctor.id, newDate);
    }
  };

  const handleContinueToConfirm = () => {
    if (selectedTime) {
      setStep(3);
    } else {
      alert('Please select a time slot');
    }
  };

  const handleBookAppointment = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for appointment');
      return;
    }

    if (!selectedSlotId) {
      alert('Please select a time slot');
      return;
    }

    setBooking(true);
    try {
      const appointmentData = {
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        slotId: selectedSlotId,
        reason: reason.trim(),
        patientNotes: patientNotes.trim() || undefined
      };

      console.log('Booking appointment with data:', appointmentData);
      
      const response = await appointmentsAPI.bookAppointment(appointmentData);
      
      if (response.success) {
        alert(`Appointment booked successfully!\n\nDoctor: ${response.data.doctorName}\nDate: ${new Date(response.data.date).toLocaleDateString()}\nTime: ${response.data.time}\nLocation: ${response.data.appointmentLocation}`);
        onClose();
        
        // Optionally refresh dashboard or appointments list
        if (onBookAppointment) {
          await onBookAppointment(response.data);
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment: ' + (error.message || 'Please try again.'));
    } finally {
      setBooking(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedTime('');
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Book Doctor Appointment" 
      size="large"
    >
      <div className="appointment-modal-content">
        {/* Progress Steps */}
        <div className="appointment-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Doctor</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Choose Time</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirm</div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="step-content">
            {error && (
              <div className="error-banner">{error}</div>
            )}

            {/* Search and Filter */}
            <div className="doctor-filters">
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="specialty-filter"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loadingDoctors ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading doctors...</p>
              </div>
            ) : (
              <>
                {/* Doctors Grid */}
                <div className="doctors-grid">
                  {filteredDoctors.map(doctor => (
                    <div 
                      key={doctor.id} 
                      className="doctor-card"
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <div className="doctor-avatar">
                        {doctor.image?.startsWith('http') ? (
                          <img src={doctor.image} alt={doctor.name} />
                        ) : (
                          <span className="avatar-emoji">👨‍⚕️</span>
                        )}
                      </div>
                      <div className="doctor-info">
                        <h3>{doctor.name}</h3>
                        <p className="doctor-specialty">{doctor.specialty}</p>
                        <p className="doctor-experience">
                          <span className="icon">💼</span>
                          {doctor.experience}
                        </p>
                        <div className="doctor-footer">
                          <div className="doctor-rating">
                            <span className="icon">⭐</span>
                            {doctor.rating || 4.5}
                          </div>
                          <div className="doctor-fees">
                            {doctor.currency || '$'}{doctor.fees}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredDoctors.length === 0 && !loadingDoctors && (
                  <div className="no-results">
                    <p>No doctors found matching your criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && selectedDoctor && (
          <div className="step-content">
            {error && (
              <div className="error-banner">{error}</div>
            )}

            <div className="selected-doctor-summary">
              <div className="doctor-avatar-large">
                {selectedDoctor.image?.startsWith('http') ? (
                  <img src={selectedDoctor.image} alt={selectedDoctor.name} />
                ) : (
                  <span className="avatar-emoji">👨‍⚕️</span>
                )}
              </div>
              <div>
                <h3>{selectedDoctor.name}</h3>
                <p>{selectedDoctor.specialty}</p>
                <p className="doctor-fee-info">
                  Consultation Fee: {selectedDoctor.currency || '$'}{selectedDoctor.fees}
                </p>
              </div>
            </div>

            <div className="date-time-selection">
              <div className="form-group">
                <label>Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-input"
                />
              </div>

              <div className="form-group">
                <label>
                  Available Time Slots
                  {loadingSlots && <span className="loading-inline"> (Loading...)</span>}
                </label>
                
                {loadingSlots ? (
                  <div className="loading-slots">
                    <div className="spinner-small"></div>
                    <p>Checking availability...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="time-slots-grid">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.slotId}
                        className={`time-slot ${selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                        onClick={() => slot.available && handleTimeSelect(slot)}
                        disabled={!slot.available}
                      >
                        {slot.time}
                        {!slot.available && <span className="booked-badge">Booked</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-slots">
                    <p>No available time slots for this date. Please select another date.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-back" onClick={handleBack}>
                ← Back
              </button>
              <button 
                className="btn-continue" 
                onClick={handleContinueToConfirm}
                disabled={!selectedTime || loadingSlots}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Appointment */}
        {step === 3 && selectedDoctor && (
          <div className="step-content">
            <div className="appointment-summary">
              <h3>Appointment Summary</h3>
              
              <div className="summary-card">
                <div className="summary-row">
                  <span className="label">Doctor:</span>
                  <span className="value">{selectedDoctor.name}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Specialty:</span>
                  <span className="value">{selectedDoctor.specialty}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="label">Time:</span>
                  <span className="value">{selectedTime}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Consultation Fee:</span>
                  <span className="value fees">{selectedDoctor.fees}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Appointment *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for visit..."
                  rows="3"
                  className="reason-textarea"
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Any additional information or special requirements..."
                  rows="2"
                  className="reason-textarea"
                />
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-back" onClick={handleBack}>
                ← Back
              </button>
              <button 
                className="btn-book" 
                onClick={handleBookAppointment}
                disabled={booking}
              >
                {booking ? 'Booking...' : 'Confirm & Book'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default DoctorAppointmentModal;

