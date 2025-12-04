import { useState, useEffect } from 'react';
import Modal from './Modal';
import { appointmentsAPI } from '../utils/api';
import './MyAppointmentsModal.css';

function MyAppointmentsModal({ isOpen, onClose }) {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await appointmentsAPI.getMyAppointments();
      
      if (response.success && response.data) {
        setAppointments({
          upcoming: response.data.upcoming || [],
          past: response.data.past || []
        });
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen]);

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    // User clicked cancel on prompt
    if (reason === null) return;

    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setCancellingId(appointmentId);
      
      const response = await appointmentsAPI.cancelAppointment(appointmentId, reason);
      
      if (response.success) {
        alert('Appointment cancelled successfully!');
        // Refresh appointments list
        await fetchAppointments();
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment: ' + (err.message || 'Please try again.'));
    } finally {
      setCancellingId(null);
    }
  };

  // Handle reschedule (placeholder - would open reschedule modal)
  const handleRescheduleAppointment = async (appointmentId) => {
    alert('Reschedule feature coming soon! For now, please cancel and book a new appointment.');
    // TODO: Implement reschedule modal
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#00d4aa',
      completed: '#22c55e',
      cancelled: '#ef4444',
      rescheduled: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const renderAppointmentCard = (appointment, isUpcoming = true) => (
    <div key={appointment.appointmentId} className="appointment-card">
      <div className="appointment-header">
        <div className="doctor-info-compact">
          <div className="doctor-avatar-small">
            {appointment.doctorImage?.startsWith('http') ? (
              <img src={appointment.doctorImage} alt={appointment.doctorName} />
            ) : (
              <span className="avatar-emoji-small">👨‍⚕️</span>
            )}
          </div>
          <div>
            <h3>{appointment.doctorName}</h3>
            <p className="specialty-badge">{appointment.specialty}</p>
          </div>
        </div>
        <div 
          className="status-badge"
          style={{ backgroundColor: `${getStatusColor(appointment.status)}20`, color: getStatusColor(appointment.status) }}
        >
          {appointment.status}
        </div>
      </div>

      <div className="appointment-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <span className="detail-label">Date:</span>
          <span className="detail-value">{formatDate(appointment.date)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-icon">⏰</span>
          <span className="detail-label">Time:</span>
          <span className="detail-value">{appointment.time}</span>
        </div>

        <div className="detail-row">
          <span className="detail-icon">📍</span>
          <span className="detail-label">Location:</span>
          <span className="detail-value">{appointment.location || 'Not specified'}</span>
        </div>

        <div className="detail-row">
          <span className="detail-icon">💰</span>
          <span className="detail-label">Fee:</span>
          <span className="detail-value fee">{appointment.currency || '$'}{appointment.fees}</span>
        </div>

        {appointment.reason && (
          <div className="detail-row full-width">
            <span className="detail-icon">📝</span>
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{appointment.reason}</span>
          </div>
        )}
      </div>

      {isUpcoming && appointment.canCancel && (
        <div className="appointment-actions">
          {appointment.canReschedule && (
            <button 
              className="btn-action reschedule"
              onClick={() => handleRescheduleAppointment(appointment.appointmentId)}
              disabled={cancellingId === appointment.appointmentId}
            >
              🔄 Reschedule
            </button>
          )}
          <button 
            className="btn-action cancel"
            onClick={() => handleCancelAppointment(appointment.appointmentId)}
            disabled={cancellingId === appointment.appointmentId}
          >
            {cancellingId === appointment.appointmentId ? 'Cancelling...' : '❌ Cancel'}
          </button>
        </div>
      )}

      {!isUpcoming && appointment.canReview && (
        <div className="appointment-actions">
          <button className="btn-action review">
            ⭐ Write Review
          </button>
        </div>
      )}
    </div>
  );

  const currentAppointments = activeTab === 'upcoming' ? appointments.upcoming : appointments.past;
  const hasAppointments = currentAppointments.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Appointments" size="large">
      <div className="my-appointments-container">
        {/* Tabs */}
        <div className="appointments-tabs">
          <button
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({appointments.upcoming.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({appointments.past.length})
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your appointments...</p>
          </div>
        ) : (
          <>
            {/* Appointments List */}
            {hasAppointments ? (
              <div className="appointments-list">
                {currentAppointments.map(appointment => 
                  renderAppointmentCard(appointment, activeTab === 'upcoming')
                )}
              </div>
            ) : (
              /* No Appointments State */
              <div className="no-appointments">
                <div className="no-appointments-icon">
                  {activeTab === 'upcoming' ? '📅' : '✅'}
                </div>
                <h3>
                  {activeTab === 'upcoming' 
                    ? 'No Upcoming Appointments' 
                    : 'No Past Appointments'}
                </h3>
                <p>
                  {activeTab === 'upcoming'
                    ? 'You have no upcoming appointments. Book your first appointment with our doctors!'
                    : 'You have no appointment history yet.'}
                </p>
                {activeTab === 'upcoming' && (
                  <button 
                    className="btn-book-new"
                    onClick={() => {
                      onClose();
                      // The parent can handle opening the booking modal
                    }}
                  >
                    📅 Book an Appointment
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default MyAppointmentsModal;

