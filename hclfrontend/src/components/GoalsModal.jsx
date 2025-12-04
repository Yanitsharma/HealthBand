import { useState, useEffect } from 'react';
import Modal from './Modal';
import './GoalsModal.css';

function GoalsModal({ isOpen, onClose, currentGoals, onSave }) {
  const [goals, setGoals] = useState({
    steps: 10000,
    sleep: 8,
    water: 3,
    calories: 700
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentGoals) {
      setGoals({
        steps: currentGoals.steps?.goal || 10000,
        sleep: currentGoals.sleep?.goal || 8,
        water: currentGoals.water?.goal || 3,
        calories: currentGoals.calories?.goal || 700
      });
    }
  }, [currentGoals, isOpen]);

  const handleChange = (field, value) => {
    setGoals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(goals);
      onClose();
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Daily Goals" size="medium">
      <form onSubmit={handleSubmit} className="goals-form">
        <p className="goals-description">
          Set your daily health and fitness goals. Track your progress throughout the day!
        </p>

        <div className="goals-grid">
          {/* Steps Goal */}
          <div className="goal-input-group">
            <label htmlFor="steps">
              <span className="goal-icon steps-icon">🚶</span>
              <span className="goal-label">Daily Steps</span>
            </label>
            <div className="input-with-unit">
              <input
                type="number"
                id="steps"
                value={goals.steps}
                onChange={(e) => handleChange('steps', parseInt(e.target.value) || 0)}
                min="0"
                step="100"
                required
              />
              <span className="unit">steps</span>
            </div>
            <span className="goal-hint">Recommended: 10,000 steps/day</span>
          </div>

          {/* Sleep Goal */}
          <div className="goal-input-group">
            <label htmlFor="sleep">
              <span className="goal-icon sleep-icon">😴</span>
              <span className="goal-label">Sleep Duration</span>
            </label>
            <div className="input-with-unit">
              <input
                type="number"
                id="sleep"
                value={goals.sleep}
                onChange={(e) => handleChange('sleep', parseFloat(e.target.value) || 0)}
                min="0"
                max="24"
                step="0.5"
                required
              />
              <span className="unit">hours</span>
            </div>
            <span className="goal-hint">Recommended: 7-9 hours/day</span>
          </div>

          {/* Water Goal */}
          <div className="goal-input-group">
            <label htmlFor="water">
              <span className="goal-icon water-icon">💧</span>
              <span className="goal-label">Water Intake</span>
            </label>
            <div className="input-with-unit">
              <input
                type="number"
                id="water"
                value={goals.water}
                onChange={(e) => handleChange('water', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
                required
              />
              <span className="unit">liters</span>
            </div>
            <span className="goal-hint">Recommended: 2-3 liters/day</span>
          </div>

          {/* Calories Goal */}
          <div className="goal-input-group">
            <label htmlFor="calories">
              <span className="goal-icon calories-icon">🔥</span>
              <span className="goal-label">Calories Burned</span>
            </label>
            <div className="input-with-unit">
              <input
                type="number"
                id="calories"
                value={goals.calories}
                onChange={(e) => handleChange('calories', parseInt(e.target.value) || 0)}
                min="0"
                step="50"
                required
              />
              <span className="unit">kcal</span>
            </div>
            <span className="goal-hint">Recommended: 500-800 kcal/day</span>
          </div>
        </div>

        <div className="goals-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default GoalsModal;

