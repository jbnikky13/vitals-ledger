// Everything lives in localStorage. Nothing is sent anywhere, ever.
const KEY = 'vitals-ledger:v1';

const empty = () => ({
  profile: { name: '', dob: '', bloodType: '', height: '' },
  vitals: [],      // { id, date, weight, restingHR, vo2max, notes }
  workouts: [],    // { id, date, type, distanceKm, durationMin, notes }
  medical: {
    allergies: [],     // { id, label, severity, notes }
    medications: [],   // { id, label, dose, frequency, notes }
    conditions: [],    // { id, label, since, notes }
    surgeries: [],     // { id, label, date, notes }
    family: []         // { id, label, relation, notes }
  }
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    // shallow-merge to survive schema additions gracefully
    const base = empty();
    return {
      profile: { ...base.profile, ...(parsed.profile || {}) },
      vitals: parsed.vitals || [],
      workouts: parsed.workouts || [],
      medical: { ...base.medical, ...(parsed.medical || {}) }
    };
  } catch (e) {
    console.error('Could not read local data, starting fresh.', e);
    return empty();
  }
}

let state = load();

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const db = {
  get state() { return state; },

  updateProfile(patch) {
    state.profile = { ...state.profile, ...patch };
    save();
  },

  addVital(entry) {
    state.vitals.push({ id: uid(), ...entry });
    state.vitals.sort((a, b) => a.date.localeCompare(b.date));
    save();
  },
  deleteVital(id) {
    state.vitals = state.vitals.filter(v => v.id !== id);
    save();
  },

  addWorkout(entry) {
    state.workouts.push({ id: uid(), ...entry });
    state.workouts.sort((a, b) => b.date.localeCompare(a.date));
    save();
  },
  deleteWorkout(id) {
    state.workouts = state.workouts.filter(w => w.id !== id);
    save();
  },

  addMedical(category, entry) {
    state.medical[category].push({ id: uid(), ...entry });
    save();
  },
  deleteMedical(category, id) {
    state.medical[category] = state.medical[category].filter(x => x.id !== id);
    save();
  },

  exportJSON() {
    return JSON.stringify(state, null, 2);
  },

  importJSON(json) {
    const parsed = JSON.parse(json);
    state = { ...empty(), ...parsed };
    save();
  },

  wipeAll() {
    state = empty();
    save();
  }
};
