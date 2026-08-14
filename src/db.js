import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (k) => `@heavy:${k}`;

export const db = {
  /* ─── EXERCISES ─── */
  getExercises: async () => {
    try {
      const stored = await AsyncStorage.getItem(key('exercises_seeded'));
      if (!stored) {
        // First launch: seed from bundled JSON
        const raw = require('./data/exercises_raw.json');
        await AsyncStorage.setItem(key('exercises_seeded'), '1');
        await AsyncStorage.setItem(key('exercises'), JSON.stringify(raw));
        return raw;
      }
      const data = await AsyncStorage.getItem(key('exercises'));
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('getExercises', e);
      return [];
    }
  },

  /* ─── ROUTINES ─── */
  getRoutines: async () => {
    try {
      const data = await AsyncStorage.getItem(key('routines'));
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  saveRoutines: async (routines) => {
    await AsyncStorage.setItem(key('routines'), JSON.stringify(routines));
  },
  addRoutine: async (routine) => {
    const routines = await db.getRoutines();
    const r = { ...routine, id: Date.now().toString(), createdAt: new Date().toISOString() };
    routines.push(r);
    await db.saveRoutines(routines);
    return r;
  },
  updateRoutine: async (id, data) => {
    const routines = await db.getRoutines();
    const idx = routines.findIndex(r => r.id === id);
    if (idx !== -1) { routines[idx] = { ...routines[idx], ...data }; await db.saveRoutines(routines); }
  },
  deleteRoutine: async (id) => {
    const routines = (await db.getRoutines()).filter(r => r.id !== id);
    await db.saveRoutines(routines);
  },

  /* ─── WORKOUT HISTORY ─── */
  getWorkouts: async () => {
    try {
      const data = await AsyncStorage.getItem(key('workouts'));
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  saveWorkout: async (workout) => {
    const workouts = await db.getWorkouts();
    const w = { ...workout, id: Date.now().toString(), date: new Date().toISOString() };
    workouts.unshift(w); // newest first
    await AsyncStorage.setItem(key('workouts'), JSON.stringify(workouts));
    // Update PRs
    await db._updatePRs(w);
    return w;
  },
  _updatePRs: async (workout) => {
    const prs = await db.getPRs();
    for (const ex of (workout.exercises || [])) {
      for (const set of (ex.sets || [])) {
        const kg = parseFloat(set.kg) || 0;
        const reps = parseInt(set.reps) || 0;
        const vol = kg * reps;
        if (!prs[ex.id]) prs[ex.id] = {};
        if (kg > (prs[ex.id].heaviest || 0)) prs[ex.id].heaviest = kg;
        if (vol > (prs[ex.id].bestSetVol || 0)) prs[ex.id].bestSetVol = vol;
      }
    }
    await AsyncStorage.setItem(key('prs'), JSON.stringify(prs));
  },
  getPRs: async () => {
    try {
      const data = await AsyncStorage.getItem(key('prs'));
      return data ? JSON.parse(data) : {};
    } catch (e) { return {}; }
  },
  getExerciseHistory: async (exId) => {
    const workouts = await db.getWorkouts();
    return workouts
      .filter(w => w.exercises?.some(e => e.id === exId))
      .map(w => ({ date: w.date, workoutId: w.id, sets: w.exercises.find(e => e.id === exId)?.sets || [] }));
  },

  /* ─── BODY STATS ─── */
  getBodyStats: async () => {
    try {
      const data = await AsyncStorage.getItem(key('bodyStats'));
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  addBodyStat: async (entry) => {
    const stats = await db.getBodyStats();
    stats.unshift({ ...entry, id: Date.now().toString(), date: new Date().toISOString() });
    await AsyncStorage.setItem(key('bodyStats'), JSON.stringify(stats));
  },
};
