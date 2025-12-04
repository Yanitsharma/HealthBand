import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, remindersAPI } from '../utils/api';
import GoalsModal from './GoalsModal';
import ReminderModal from './ReminderModal';
import RemindersListModal from './RemindersListModal';
import DoctorAppointmentModal from './DoctorAppointmentModal';
import MyAppointmentsModal from './MyAppointmentsModal';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard data state
  const [activityData, setActivityData] = useState({
    steps: { current: 0, goal: 10000, unit: 'steps' },
    sleep: { current: 0, goal: 8, unit: 'hrs' },
    water: { current: 0, goal: 3, unit: 'L' },
    calories: { current: 0, goal: 700, unit: 'kcal' }
  });

  const [reminders, setReminders] = useState([]);
  const [healthTip, setHealthTip] = useState('');

  // Modal states
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showRemindersListModal, setShowRemindersListModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMyAppointmentsModal, setShowMyAppointmentsModal] = useState(false);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'logged_in') {
      setError('⚠️ No valid authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await dashboardAPI.getDashboardData();
      
      console.log('Dashboard data received:', response);

      if (response.success && response.data) {
        const { user: userData, todaysActivity, reminders: remindersList, healthTip: tip } = response.data;

        // Update user info
        if (userData) {
          setUser(userData);
        }

        // Update activity data with units
        if (todaysActivity) {
          setActivityData({
            steps: { 
              current: todaysActivity.steps?.current || 0, 
              goal: todaysActivity.steps?.goal || 10000, 
              unit: 'steps' 
            },
            sleep: { 
              current: todaysActivity.sleep?.current || 0, 
              goal: todaysActivity.sleep?.goal || 8, 
              unit: 'hrs' 
            },
            water: { 
              current: todaysActivity.water?.current || 0, 
              goal: todaysActivity.water?.goal || 3, 
              unit: 'L' 
            },
            calories: { 
              current: todaysActivity.calories?.current || 0, 
              goal: todaysActivity.calories?.goal || 700, 
              unit: 'kcal' 
            }
          });
        }

        // Update reminders
        if (remindersList) {
          setReminders(remindersList);
        }

        // Update health tip
        if (tip) {
          setHealthTip(tip);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Using default values.');
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token in localStorage:', token);
    console.log('User data in localStorage:', userData);
    
    if (!token) {
      console.log('No token found, redirecting to login...');
      navigate('/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [navigate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Handle setting daily goals
  const handleSetGoals = () => {
    setShowGoalsModal(true);
  };

  const handleSaveGoals = async (newGoals) => {
    try {
      const response = await dashboardAPI.updateGoals(newGoals);
      if (response.success) {
        console.log('Goals updated:', response.data);
        await fetchDashboardData(); // Refresh data
        alert('Goals updated successfully!');
      }
    } catch (err) {
      console.error('Error updating goals:', err);
      alert('Failed to update goals: ' + err.message);
      throw err;
    }
  };

  // Handle adding a reminder
  const handleAddReminder = () => {
    setShowReminderModal(true);
  };

  const handleSaveReminder = async (reminderData, reminderId) => {
    try {
      let response;
      if (reminderId) {
        response = await remindersAPI.updateReminder(reminderId, reminderData);
      } else {
        response = await remindersAPI.addReminder(reminderData);
      }
      
      if (response.success) {
        console.log('Reminder saved:', response.data);
        await fetchDashboardData(); // Refresh data
        alert(reminderId ? 'Reminder updated successfully!' : 'Reminder added successfully!');
      }
    } catch (err) {
      console.error('Error saving reminder:', err);
      alert('Failed to save reminder: ' + err.message);
      throw err;
    }
  };

  // Handle deleting a reminder
  const handleDeleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await remindersAPI.deleteReminder(reminderId);
      if (response.success) {
        console.log('Reminder deleted');
        await fetchDashboardData(); // Refresh data
        alert('Reminder deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting reminder:', err);
      alert('Failed to delete reminder: ' + err.message);
    }
  };

  // Handle marking reminder as complete
  const handleCompleteReminder = async (reminderId) => {
    try {
      const response = await remindersAPI.markComplete(reminderId);
      if (response.success) {
        console.log('Reminder marked as complete');
        await fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Error completing reminder:', err);
      alert('Failed to complete reminder: ' + err.message);
    }
  };

  // Handle viewing all reminders
  const handleViewAllReminders = () => {
    setShowRemindersListModal(true);
  };

  // Handle booking appointment callback (optional refresh after booking)
  const handleBookAppointment = async (appointmentData) => {
    try {
      console.log('Appointment booked successfully:', appointmentData);
      // Optionally refresh dashboard data or show a notification
      // You could fetch updated appointments list here if needed
      return { success: true };
    } catch (err) {
      console.error('Error in appointment callback:', err);
      throw err;
    }
  };

  // Handle getting a new health tip
  const handleNewTip = async () => {
    try {
      // Refresh the dashboard to get a new random tip
      await fetchDashboardData();
      alert('New health tip loaded!');
    } catch (err) {
      console.error('Error getting new tip:', err);
      alert('Failed to get new tip: ' + err.message);
    }
  };

  if (loading && !user) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Error Message */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">HB</span>
          </div>
          <div className="header-title">
            <h1>HealthBand</h1>
            <p>Your daily wellness snapshot</p>
          </div>
        </div>
        <div className="header-right">
          <button className="my-appointments-btn" onClick={() => setShowMyAppointmentsModal(true)}>
            <span className="icon">📋</span>
            My Appointments
          </button>
          <button className="book-appointment-btn" onClick={() => setShowAppointmentModal(true)}>
            <span className="icon">🩺</span>
            Book Appointment
          </button>
          <button className="complete-profile-btn">
            <span className="icon">✏️</span>
            Complete your profile
          </button>
          <div className="user-avatar" title={user?.name || 'User'}>
            {getInitials(user?.name || user?.username || 'User')}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Today's Activity Section */}
      <section className="activity-section">
        <div className="section-header">
          <h2>Today's activity</h2>
          <button className="set-goals-btn" onClick={handleSetGoals}>
            <span className="icon">🎯</span>
            Set daily goals
          </button>
        </div>

        <div className="activity-cards">
          {/* Steps Card */}
          <div className="activity-card">
            <div className="card-icon steps-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.12 10H19V8.2h-3.62l-1.93-2.6a2.01 2.01 0 0 0-2.51-.47l-2.92 1.43C7.42 6.99 7 7.6 7 8.32v5.66a2 2 0 0 0 2 2h3.01l1.05 4.19a1.99 1.99 0 0 0 1.93 1.54c.81 0 1.5-.5 1.77-1.29l1.25-3.54L19 17V7l-2 2h-2.88z"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Steps taken</h3>
              <div className="card-value">
                {activityData.steps.current.toLocaleString()} <span className="unit">{activityData.steps.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.steps.goal.toLocaleString()} {activityData.steps.unit}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${calculateProgress(activityData.steps.current, activityData.steps.goal)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sleep Card */}
          <div className="activity-card">
            <div className="card-icon sleep-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9a9 9 0 0 0 0-18zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Sleep</h3>
              <div className="card-value">
                {activityData.sleep.current} <span className="unit">{activityData.sleep.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.sleep.goal} {activityData.sleep.unit}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${calculateProgress(activityData.sleep.current, activityData.sleep.goal)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Water Intake Card */}
          <div className="activity-card">
            <div className="card-icon water-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Water intake</h3>
              <div className="card-value">
                {activityData.water.current} <span className="unit">{activityData.water.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.water.goal} {activityData.water.unit}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${calculateProgress(activityData.water.current, activityData.water.goal)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Calories Card */}
          <div className="activity-card">
            <div className="card-icon calories-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Calories burned</h3>
              <div className="card-value">
                {activityData.calories.current} <span className="unit">{activityData.calories.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.calories.goal} {activityData.calories.unit}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${calculateProgress(activityData.calories.current, activityData.calories.goal)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Reminders and Health Tip */}
      <section className="bottom-section">
        {/* Health Reminders */}
        <div className="reminders-panel">
          <div className="panel-header">
            <h2>Health reminders</h2>
            <div className="panel-header-actions">
              <button className="view-all-btn" onClick={handleViewAllReminders}>
                <span className="icon">👁️</span>
                View All
              </button>
              <button className="add-btn" onClick={handleAddReminder}>
                <span className="icon">+</span>
                Add reminder
              </button>
            </div>
          </div>
          <div className="reminders-list">
            {reminders.length === 0 ? (
              <div className="no-reminders">
                <p>No reminders yet. Click "Add reminder" to create one.</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div key={reminder._id} className="reminder-item">
                  <div className="reminder-content">
                    <h4>{reminder.title}</h4>
                    <span className={`reminder-tag ${reminder.category.toLowerCase()}`}>
                      {reminder.category}
                    </span>
                  </div>
                  <div className="reminder-actions">
                    <div className="reminder-time">{reminder.timeRemaining}</div>
                    <button 
                      className="reminder-delete-btn" 
                      onClick={() => handleDeleteReminder(reminder._id)}
                      title="Delete reminder"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Health Tip of the Day */}
        <div className="health-tip-panel">
          <div className="panel-header">
            <h2>Health tip of the day</h2>
            <button className="new-tip-btn" onClick={handleNewTip}>
              <span className="icon">🔄</span>
              New tip
            </button>
          </div>
          <div className="tip-content">
            <p>{healthTip || 'Loading health tip...'}</p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <GoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        currentGoals={activityData}
        onSave={handleSaveGoals}
      />

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={handleSaveReminder}
      />

      <RemindersListModal
        isOpen={showRemindersListModal}
        onClose={() => setShowRemindersListModal(false)}
        reminders={reminders}
        onAddReminder={handleSaveReminder}
        onEditReminder={(id, data) => handleSaveReminder(data, id)}
        onDeleteReminder={handleDeleteReminder}
        onCompleteReminder={handleCompleteReminder}
      />

      <DoctorAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onBookAppointment={handleBookAppointment}
      />

      <MyAppointmentsModal
        isOpen={showMyAppointmentsModal}
        onClose={() => setShowMyAppointmentsModal(false)}
      />
    </div>
  );
}

export default Dashboard;

