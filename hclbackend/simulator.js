import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import User from './models/Users.js'; 
import Patient from './models/Patient.js';

dotenv.config();

// 1. CHANGE: Use Dynamic Local Port
// This ensures it works on Render (process.env.PORT) and Locally (5000)
// It talks directly to the server running alongside it.
const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api/simulate/update`;

const MONGO_URI = process.env.MONGO_URI;

// Store simulated data
const userStates = {}; 

// 📅 TRACKER: Remember the current day to detect midnight
let currentDayTracker = new Date().getDate();

// 2. CHANGE: Don't auto-start. Export the function so server.js can control it.
/* mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected. Checking for bad data...");
    startSimulation();
  })
  .catch(err => console.error("❌ DB Error:", err));
*/

// 3. CHANGE: Add 'export' keyword
export async function startSimulation() {
  console.log(`🤖 Smart Simulator Starting in Background... (Tracking Day: ${currentDayTracker})`);
  console.log(`📡 Sending updates to: ${API_URL}`);

  // 1. Initialize from DB & FIX BAD DATA
  try {
      const patients = await Patient.find();
      
      for (const p of patients) {
        if(p.userId) {
            const uId = p.userId.toString();
            
            let initialSteps = p.todaysActivity?.steps?.current || 0;
            let initialCalories = p.todaysActivity?.calories?.current || 0;
            let initialSleep = p.todaysActivity?.sleep?.current || 0;
            let initialWater = p.todaysActivity?.water?.current || 0;

            // --- 🧹 SANITY CHECK (Stricter Limits) ---
            if (initialSleep > 9) {
                console.log(`⚠️ Detected bad Sleep data for user (${initialSleep}). Resetting to 0.`);
                initialSleep = 0;
                await axios.post(API_URL, { userId: uId, type: 'sleep', value: 0 });
            }
            if (initialSteps > 12000) {
                console.log(`⚠️ Detected bad steps data for user (${initialSteps}). Resetting to 0.`);
                initialSteps = 0;
                await axios.post(API_URL, { userId: uId, type: 'steps', value: 0 });
            }
            if (initialWater > 4) {
                console.log(`⚠️ Detected bad Water data for user (${initialWater}). Resetting to 0.`);
                initialWater = 0;
                await axios.post(API_URL, { userId: uId, type: 'water', value: 0 });
            }

            userStates[uId] = {
                steps: initialSteps,
                calories: initialCalories,
                sleep: initialSleep,
                water: initialWater
            };
        }
      }
  } catch (err) {
      console.error("❌ Simulator Init Error (Is DB Connected?):", err.message);
  }

  // 2. FAST LOOP: Steps & Calories (Every 3 seconds)
  setInterval(async () => {
    try {
      const users = await User.find({}, '_id');
      for (const user of users) {
        const userId = user._id.toString();
        if (!userStates[userId]) initUser(userId);

        // Increment Steps
        const stepsToAdd = Math.floor(Math.random() * 25) + 5; 
        userStates[userId].steps += stepsToAdd;
        userStates[userId].calories += Math.floor(stepsToAdd * 0.05);

        // Send Updates
        await axios.post(API_URL, { userId, type: 'steps', value: userStates[userId].steps });
        await axios.post(API_URL, { userId, type: 'calories', value: userStates[userId].calories });
      }
      process.stdout.write(`\r⚡ Updating Steps... (${Object.values(userStates)[0]?.steps})`);
    } catch (error) { console.log("Sim Error:", error.message); }
  }, 3000);

  // 3. SLOW LOOP: Water, Sleep & MIDNIGHT RESET (Every 10 seconds)
  setInterval(async () => {
    try {
        // --- 🌙 MIDNIGHT CHECK ---
        const now = new Date();
        const today = now.getDate();

        if (today !== currentDayTracker) {
            console.log(`\n📅 Date changed from ${currentDayTracker} to ${today}. Resetting Stats...`);
            currentDayTracker = today;
            await resetDailyStats();
            return; // Skip the rest of the loop
        }
        // -------------------------

        const users = await User.find({}, '_id');
        for (const user of users) {
          const userId = user._id.toString();
          if (!userStates[userId]) initUser(userId);
  
          // --- WATER LOGIC (Hard Cap at 4) ---
          if (userStates[userId].water < 4) {
              const newWater = userStates[userId].water + 0.1;
              userStates[userId].water = Math.min(4, parseFloat(newWater.toFixed(1)));
              
              await axios.post(API_URL, { userId, type: 'water', value: userStates[userId].water });
          }

          // --- SLEEP LOGIC (Hard Cap at 9) ---
          if (userStates[userId].sleep < 9) {
              const newSleep = userStates[userId].sleep + 0.5;
              userStates[userId].sleep = Math.min(9, parseFloat(newSleep.toFixed(1)));
              
              await axios.post(API_URL, { userId, type: 'sleep', value: userStates[userId].sleep });
          }
        }
        console.log("\n💧 Updated Water & Sleep");
      } catch (error) { console.log("Slow Loop Error:", error.message); }
  }, 10000); 
}

function initUser(userId) {
    userStates[userId] = { steps: 0, calories: 0, sleep: 0, water: 0 };
}

// Helper: Resets local state AND Database state to 0
async function resetDailyStats() {
    const userIds = Object.keys(userStates);
    console.log(`🔄 Resetting stats for ${userIds.length} active users...`);
    
    for (const userId of userIds) {
        // 1. Reset Local
        userStates[userId] = { steps: 0, calories: 0, sleep: 0, water: 0 };

        // 2. Reset DB
        try {
            await axios.post(API_URL, { userId, type: 'steps', value: 0 });
            await axios.post(API_URL, { userId, type: 'calories', value: 0 });
            await axios.post(API_URL, { userId, type: 'water', value: 0 });
            await axios.post(API_URL, { userId, type: 'sleep', value: 0 });
        } catch (err) {
            console.error(`❌ Failed to reset user ${userId}:`, err.message);
        }
    }
    console.log("✅ Daily Reset Complete.");
}