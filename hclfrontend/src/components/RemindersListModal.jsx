import { useState } from 'react';
import Modal from './Modal';
import ReminderModal from './ReminderModal';
import './RemindersListModal.css';

function RemindersListModal({ 
  isOpen, 
  onClose, 
  reminders, 
  onAddReminder, 
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder 
}) {
  const [editingReminder, setEditingReminder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
  };

  const handleSaveReminder = async (reminderData, reminderId) => {
    if (reminderId) {
      await onEditReminder(reminderId, reminderData);
    } else {
      await onAddReminder(reminderData);
    }
    setEditingReminder(null);
    setShowAddModal(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Lab: '#22c55e',
      Checkup: '#3b82f6',
      Diabetes: '#a855f7',
      Cardio: '#ef4444',
      Medicine: '#f59e0b',
      Other: '#6b7280'
    };
    return colors[category] || colors.Other;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="All Health Reminders" size="large">
        <div className="reminders-list-container">
          <div className="reminders-list-header">
            <p className="reminders-count">
              {reminders.length} {reminders.length === 1 ? 'Reminder' : 'Reminders'}
            </p>
            <button 
              className="btn-add-reminder" 
              onClick={() => setShowAddModal(true)}
            >
              <span className="icon">+</span>
              Add New Reminder
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="no-reminders-state">
              <span className="empty-icon">📅</span>
              <h3>No reminders yet</h3>
              <p>Create your first health reminder to stay on track</p>
              <button 
                className="btn-create-first" 
                onClick={() => setShowAddModal(true)}
              >
                Create Your First Reminder
              </button>
            </div>
          ) : (
            <div className="reminders-list-grid">
              {reminders.map(reminder => (
                <div 
                  key={reminder._id} 
                  className={`reminder-card ${reminder.isCompleted ? 'completed' : ''}`}
                >
                  <div className="reminder-card-header">
                    <span 
                      className="reminder-category-badge"
                      style={{ 
                        backgroundColor: `${getCategoryColor(reminder.category)}20`,
                        color: getCategoryColor(reminder.category)
                      }}
                    >
                      {reminder.category}
                    </span>
                    <div className="reminder-card-actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(reminder)}
                        title="Edit reminder"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => onDeleteReminder(reminder._id)}
                        title="Delete reminder"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <h3 className="reminder-card-title">{reminder.title}</h3>

                  <div className="reminder-card-details">
                    <div className="reminder-detail">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">
                        {new Date(reminder.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="reminder-detail">
                      <span className="detail-icon">⏰</span>
                      <span className="detail-text">
                        {new Date(reminder.dueDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {reminder.timeOfDay && (
                      <div className="reminder-detail">
                        <span className="detail-icon">
                          {reminder.timeOfDay === 'morning' ? '🌅' : 
                           reminder.timeOfDay === 'afternoon' ? '☀️' : 
                           reminder.timeOfDay === 'evening' ? '🌆' : '🌙'}
                        </span>
                        <span className="detail-text capitalize">{reminder.timeOfDay}</span>
                      </div>
                    )}
                  </div>

                  {reminder.notes && (
                    <div className="reminder-notes">
                      <span className="notes-icon">📝</span>
                      <p>{reminder.notes}</p>
                    </div>
                  )}

                  <div className="reminder-card-footer">
                    <span className="reminder-time-remaining">
                      {reminder.timeRemaining}
                    </span>
                    {!reminder.isCompleted && (
                      <button
                        className="btn-complete"
                        onClick={() => onCompleteReminder(reminder._id)}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Add/Edit Reminder Modal */}
      <ReminderModal
        isOpen={showAddModal || editingReminder !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
        reminder={editingReminder}
      />
    </>
  );
}

export default RemindersListModal;

