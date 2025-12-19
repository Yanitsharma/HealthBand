import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'; // Import Socket.io
import { dashboardAPI, remindersAPI } from '../utils/api';
import GoalsModal from './GoalsModal';
import ReminderModal from './ReminderModal';
import RemindersListModal from './RemindersListModal';
import DoctorAppointmentModal from './DoctorAppointmentModal';
import MyAppointmentsModal from './MyAppointmentsModal';
import './Dashboard.css';

// Initialize Socket outside component to avoid reconnection loops
const socket = io('https://healthband-1.onrender.com/'); // Ensure this matches your server port

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveStatus, setLiveStatus] = useState(false); // UI indicator for connection

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

  // 1. Initial Data Fetch (Standard HTTP)
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('⚠️ No valid authentication token found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboardData();
      
      if (response.success && response.data) {
        const { user: userData, todaysActivity, reminders: remindersList, healthTip: tip } = response.data;

        if (userData) setUser(userData);

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
        if (remindersList) setReminders(remindersList);
        if (tip) setHealthTip(tip);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Auth & Socket Setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    let userId = null;
    if (userDataStr) {
      const parsedUser = JSON.parse(userDataStr);
      setUser(parsedUser);
      userId = parsedUser._id || parsedUser.id; 
    }

    // A. Fetch initial data
    fetchDashboardData();

    // B. Setup Real-time Socket Connection
    if (userId) {
      // Join the specific user room
      socket.emit('join-room', userId);
      setLiveStatus(true);

      // Listen for updates from the Simulator/Backend
      socket.on('activity-update', (newActivityData) => {
        console.log("⚡ Live update received:", newActivityData);
        
        // Merge new live data into state smoothly
        setActivityData(prev => ({
          ...prev,
          steps: { 
            ...prev.steps, 
            current: newActivityData.steps?.current ?? prev.steps.current 
          },
          calories: { 
            ...prev.calories, 
            current: newActivityData.calories?.current ?? prev.calories.current 
          },
          water: {
            ...prev.water,
            current: newActivityData.water?.current ?? prev.water.current
          },
          sleep: {
            ...prev.sleep,
            current: newActivityData.sleep?.current ?? prev.sleep.current
          }
        }));
      });
    }

    // Cleanup listeners
    return () => {
      socket.off('activity-update');
    };
  }, [navigate]);

  // --- Helper Functions ---
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  
  const calculateProgress = (current, goal) => Math.min((current / goal) * 100, 100);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socket.emit('leave-room'); // Optional cleanup
    navigate('/login');
  };

  // --- Modal Handlers (Preserved from your code) ---
  const handleSetGoals = () => setShowGoalsModal(true);
  
  const handleSaveGoals = async (newGoals) => {
    try {
      const response = await dashboardAPI.updateGoals(newGoals);
      if (response.success) {
        await fetchDashboardData(); 
        alert('Goals updated successfully!');
      }
    } catch (err) { alert('Failed to update goals: ' + err.message); }
  };

  const handleAddReminder = () => setShowReminderModal(true);

  const handleSaveReminder = async (reminderData, reminderId) => {
    try {
      let response = reminderId 
        ? await remindersAPI.updateReminder(reminderId, reminderData)
        : await remindersAPI.addReminder(reminderData);
      
      if (response.success) {
        await fetchDashboardData();
        alert(reminderId ? 'Reminder updated!' : 'Reminder added!');
      }
    } catch (err) { alert('Failed to save reminder: ' + err.message); }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await remindersAPI.deleteReminder(reminderId);
      if (response.success) await fetchDashboardData();
    } catch (err) { alert('Error deleting reminder'); }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
        await remindersAPI.markComplete(reminderId);
        await fetchDashboardData();
    } catch(err) { console.error(err); }
  };

  const handleViewAllReminders = () => setShowRemindersListModal(true);
  const handleNewTip = async () => { await fetchDashboardData(); alert('Refreshed!'); };
  const handleBookAppointment = async (data) => { console.log('Booked', data); return { success: true }; };

  if (loading && !user) return <div className="dashboard-container"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      {error && <div className="dashboard-error">{error}</div>}

      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo"><span className="logo-icon">HB</span></div>
          <div className="header-title">
            <h1>HealthBand</h1>
            <p>Your daily wellness snapshot {liveStatus && <span style={{color:'#4caf50', fontSize:'0.8em'}}>● Live Sync Active</span>}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="my-appointments-btn" onClick={() => setShowMyAppointmentsModal(true)}>
            <span className="icon">📋</span> My Appointments
          </button>
          <button className="book-appointment-btn" onClick={() => setShowAppointmentModal(true)}>
            <span className="icon">🩺</span> Book Appointment
          </button>
          <div className="user-avatar" title={user?.name}>
            {getInitials(user?.name || user?.username)}
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="activity-section">
        <div className="section-header">
          <h2>Today's activity</h2>
          <button className="set-goals-btn" onClick={handleSetGoals}>
            <span className="icon">🎯</span> Set daily goals
          </button>
        </div>

        <div className="activity-cards">
          {/* Steps Card */}
          <div className="activity-card">
            <div className="card-icon steps-icon">👣</div>
            <div className="card-content">
              <h3>Steps taken</h3>
              <div className="card-value">
                {activityData.steps.current.toLocaleString()} <span className="unit">{activityData.steps.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.steps.goal.toLocaleString()}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${calculateProgress(activityData.steps.current, activityData.steps.goal)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Sleep Card */}
          <div className="activity-card">
            <div className="card-icon sleep-icon">🌙</div>
            <div className="card-content">
              <h3>Sleep</h3>
              <div className="card-value">
                {activityData.sleep.current} <span className="unit">{activityData.sleep.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.sleep.goal}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${calculateProgress(activityData.sleep.current, activityData.sleep.goal)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Water Card */}
          <div className="activity-card">
            <div className="card-icon water-icon">💧</div>
            <div className="card-content">
              <h3>Water intake</h3>
              <div className="card-value">
                {activityData.water.current} <span className="unit">{activityData.water.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.water.goal}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${calculateProgress(activityData.water.current, activityData.water.goal)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Calories Card */}
          <div className="activity-card">
            <div className="card-icon calories-icon">🔥</div>
            <div className="card-content">
              <h3>Calories burned</h3>
              <div className="card-value">
                {activityData.calories.current} <span className="unit">{activityData.calories.unit}</span>
              </div>
              <div className="card-goal">Goal: {activityData.calories.goal}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${calculateProgress(activityData.calories.current, activityData.calories.goal)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bottom-section">
        <div className="reminders-panel">
          <div className="panel-header">
            <h2>Health reminders</h2>
            <div className="panel-header-actions">
              <button className="view-all-btn" onClick={handleViewAllReminders}>View All</button>
              <button className="add-btn" onClick={handleAddReminder}>+ Add</button>
            </div>
          </div>
          <div className="reminders-list">
            {reminders.length === 0 ? <p className="no-reminders">No reminders set.</p> : 
              reminders.slice(0, 3).map(reminder => (
                <div key={reminder._id} className="reminder-item">
                  <div className="reminder-content">
                    <h4>{reminder.title}</h4>
                    <span className="reminder-tag">{reminder.category}</span>
                  </div>
                  <button onClick={() => handleDeleteReminder(reminder._id)}>×</button>
                </div>
              ))
            }
          </div>
        </div>

        <div className="health-tip-panel">
          <div className="panel-header">
            <h2>Health tip</h2>
            <button onClick={handleNewTip}>🔄 New tip</button>
          </div>
          <div className="tip-content"><p>{healthTip || 'Stay hydrated!'}</p></div>
        </div>
      </section>

      {/* Modals */}
      <GoalsModal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} currentGoals={activityData} onSave={handleSaveGoals} />
      <ReminderModal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} onSave={handleSaveReminder} />
      <RemindersListModal isOpen={showRemindersListModal} onClose={() => setShowRemindersListModal(false)} reminders={reminders} onAddReminder={handleSaveReminder} onEditReminder={(id, data) => handleSaveReminder(data, id)} onDeleteReminder={handleDeleteReminder} onCompleteReminder={handleCompleteReminder} />
      <DoctorAppointmentModal isOpen={showAppointmentModal} onClose={() => setShowAppointmentModal(false)} onBookAppointment={handleBookAppointment} />
      <MyAppointmentsModal isOpen={showMyAppointmentsModal} onClose={() => setShowMyAppointmentsModal(false)} />
    </div>
  );
}

export default Dashboard;