import Patient from "../models/Patient.js";
import Reminder from "../models/Reminder.js";

// Health tips pool
const healthTipsPool = [
  "Take a 5-minute walk every hour to improve circulation and reduce stiffness.",
  "Drink water first thing in the morning to kickstart your metabolism.",
  "Get 7-8 hours of quality sleep for optimal health and recovery.",
  "Practice deep breathing for 5 minutes daily to reduce stress.",
  "Eat a colorful variety of fruits and vegetables for maximum nutrients.",
  "Limit screen time before bed to improve sleep quality.",
  "Take the stairs instead of the elevator to increase daily activity.",
  "Stay hydrated by drinking at least 8 glasses of water daily.",
  "Do stretching exercises to improve flexibility and prevent injuries.",
  "Maintain good posture to prevent back and neck pain.",
];

// Get random health tip
const getRandomHealthTip = () => {
  return healthTipsPool[Math.floor(Math.random() * healthTipsPool.length)];
};

// Get time remaining text
const getTimeRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 14) return "Next week";
  return `In ${Math.ceil(diffDays / 7)} weeks`;
};

// @desc    Get patient dashboard data
// @route   GET /api/patient/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create patient data
    let patient = await Patient.findOne({ userId });

    if (!patient) {
      // Create default patient data
      patient = await Patient.create({
        userId,
        todaysActivity: {
          steps: { current: 0, goal: 10000 },
          sleep: { current: 0, goal: 8 },
          water: { current: 0, goal: 3 },
          calories: { current: 0, goal: 700 },
        },
      });
    }

    // Get upcoming reminders (not completed, sorted by due date)
    const reminders = await Reminder.find({
      userId,
      isCompleted: false,
      dueDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })
      .sort({ dueDate: 1 })
      .limit(10);

    // Format reminders with time remaining
    const formattedReminders = reminders.map((reminder) => ({
      _id: reminder._id,
      title: reminder.title,
      category: reminder.category,
      dueDate: reminder.dueDate,
      timeRemaining: getTimeRemaining(reminder.dueDate),
      notes: reminder.notes,
    }));

    // Get today's health tip
    const todaysTip = getRandomHealthTip();

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          username: req.user.username,
          profileCompletion: patient.profileCompletion,
        },
        todaysActivity: patient.todaysActivity,
        reminders: formattedReminders,
        healthTip: todaysTip,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update daily goals
// @route   PUT /api/patient/goals
// @access  Private
export const updateGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps, sleep, water, calories } = req.body;

    let patient = await Patient.findOne({ userId });

    if (!patient) {
      patient = await Patient.create({ userId });
    }

    // Update only provided goals
    if (steps !== undefined) patient.todaysActivity.steps.goal = steps;
    if (sleep !== undefined) patient.todaysActivity.sleep.goal = sleep;
    if (water !== undefined) patient.todaysActivity.water.goal = water;
    if (calories !== undefined) patient.todaysActivity.calories.goal = calories;

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Goals updated successfully",
      data: patient.todaysActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update today's activity progress
// @route   PUT /api/patient/activity
// @access  Private
export const updateActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps, sleep, water, calories } = req.body;

    let patient = await Patient.findOne({ userId });

    if (!patient) {
      patient = await Patient.create({ userId });
    }

    // Update only provided activity values
    if (steps !== undefined) patient.todaysActivity.steps.current = steps;
    if (sleep !== undefined) patient.todaysActivity.sleep.current = sleep;
    if (water !== undefined) patient.todaysActivity.water.current = water;
    if (calories !== undefined)
      patient.todaysActivity.calories.current = calories;

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: patient.todaysActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add a health reminder
// @route   POST /api/patient/reminders
// @access  Private
export const addReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category, dueDate, timeOfDay, notes } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title and due date are required",
      });
    }

    const reminder = await Reminder.create({
      userId,
      title,
      category: category || "Other",
      dueDate,
      timeOfDay,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Reminder added successfully",
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reminders
// @route   GET /api/patient/reminders
// @access  Private
export const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { completed } = req.query;

    const filter = { userId };
    if (completed !== undefined) {
      filter.isCompleted = completed === "true";
    }

    const reminders = await Reminder.find(filter).sort({ dueDate: 1 });

    const formattedReminders = reminders.map((reminder) => ({
      _id: reminder._id,
      title: reminder.title,
      category: reminder.category,
      dueDate: reminder.dueDate,
      timeRemaining: getTimeRemaining(reminder.dueDate),
      timeOfDay: reminder.timeOfDay,
      notes: reminder.notes,
      isCompleted: reminder.isCompleted,
    }));

    res.status(200).json({
      success: true,
      data: formattedReminders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a reminder
// @route   PUT /api/patient/reminders/:id
// @access  Private
export const updateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, category, dueDate, timeOfDay, notes, isCompleted } =
      req.body;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    // Update fields
    if (title !== undefined) reminder.title = title;
    if (category !== undefined) reminder.category = category;
    if (dueDate !== undefined) reminder.dueDate = dueDate;
    if (timeOfDay !== undefined) reminder.timeOfDay = timeOfDay;
    if (notes !== undefined) reminder.notes = notes;
    if (isCompleted !== undefined) reminder.isCompleted = isCompleted;

    await reminder.save();

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/patient/reminders/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset daily activity (for testing or daily reset)
// @route   POST /api/patient/reset-daily
// @access  Private
export const resetDailyActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient data not found",
      });
    }

    // Reset current values to 0, keep goals
    patient.todaysActivity.steps.current = 0;
    patient.todaysActivity.sleep.current = 0;
    patient.todaysActivity.water.current = 0;
    patient.todaysActivity.calories.current = 0;

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Daily activity reset successfully",
      data: patient.todaysActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

