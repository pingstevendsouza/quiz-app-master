// Preset total quiz durations, 30-minute increments from 30 min up to 5 hours.
// Values are total seconds (matches how QuizContext consumes countdownTime).
const label = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h} hour${h > 1 ? 's' : ''} ${m} min`;
};

const COUNTDOWN_DURATION = [];
for (let totalMinutes = 30; totalMinutes <= 5 * 60; totalMinutes += 30) {
  COUNTDOWN_DURATION.push({ key: totalMinutes, value: totalMinutes * 60, text: label(totalMinutes) });
}

export default COUNTDOWN_DURATION;
