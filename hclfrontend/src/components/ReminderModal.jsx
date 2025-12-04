import { useState, useEffect } from 'react';
import Modal from './Modal';
import './ReminderModal.css';

function ReminderModal({ isOpen, onClose, onSave, reminder = null }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Lab',
    dueDate: '',
    dueTime: '09:00',
    timeOfDay: 'morning',
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reminder) {
      // Edit mode - populate with existing reminder
      const date = new Date(reminder.dueDate);
      setFormData({
        title: reminder.title,
        category: reminder.category,
        dueDate: date.toISOString().split('T')[0],
        dueTime: date.toTimeString().slice(0, 5),
        timeOfDay: reminder.timeOfDay || 'morning',
        notes: reminder.notes || ''
      });
    } else {
      // Add mode - reset form
      setFormData({
        title: '',
        category: 'Lab',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '09:00',
        timeOfDay: 'morning',
        notes: ''
      });
    }
  }, [reminder, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Combine date and time
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}:00.000Z`).toISOString();

      const reminderData = {
        title: formData.title,
        category: formData.category,
        dueDate: dueDateTime,
        timeOfDay: formData.timeOfDay,
        notes: formData.notes || undefined
      };

      await onSave(reminderData, reminder?._id);
      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Failed to save reminder: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { value: 'Lab', icon: '🔬', color: '#22c55e' },
    { value: 'Checkup', icon: '🏥', color: '#3b82f6' },
    { value: 'Diabetes', icon: '💉', color: '#a855f7' },
    { value: 'Cardio', icon: '❤️', color: '#ef4444' },
    { value: 'Medicine', icon: '💊', color: '#f59e0b' },
    { value: 'Other', icon: '📋', color: '#6b7280' }
  ];

  const timesOfDay = [
    { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
    { value: 'evening', label: 'Evening (6 PM - 12 AM)' },
    { value: 'night', label: 'Night (12 AM - 6 AM)' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={reminder ? 'Edit Reminder' : 'Add New Reminder'} 
      size="medium"
    >
      <form onSubmit={handleSubmit} className="reminder-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Reminder Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Upcoming blood test"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category *</label>
          <div className="category-grid">
            {categories.map(cat => (
              <div
                key={cat.value}
                className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                onClick={() => handleChange('category', cat.value)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueTime">Time *</label>
            <input
              type="time"
              id="dueTime"
              value={formData.dueTime}
              onChange={(e) => handleChange('dueTime', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Time of Day */}
        <div className="form-group">
          <label htmlFor="timeOfDay">Time of Day</label>
          <select
            id="timeOfDay"
            value={formData.timeOfDay}
            onChange={(e) => handleChange('timeOfDay', e.target.value)}
          >
            {timesOfDay.map(time => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            rows="3"
          />
        </div>

        <div className="reminder-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : reminder ? 'Update Reminder' : 'Add Reminder'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ReminderModal;

