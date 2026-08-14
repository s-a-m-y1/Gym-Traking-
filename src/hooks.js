import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { db } from './db.js';
import { SET_TYPES, makeEmptySet } from './constants';

export function useExerciseSearch(query, bodyPart, equipment) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let exs = await db.getExercises();
      
      const q = query.toLowerCase();
      if (q) {
        exs = exs.filter(e => e.name.toLowerCase().includes(q));
      }
      if (bodyPart) {
        exs = exs.filter(e => e.body_part === bodyPart);
      }
      if (equipment) {
        exs = exs.filter(e => e.equipment === equipment);
      }
      setResults(exs);
      setLoading(false);
    };
    fetch();
  }, [query, bodyPart, equipment]);

  return { results, loading };
}

export function useRoutines() {
  const [routines, setRoutines] = useState([]);

  const reload = useCallback(async () => {
    const rs = await db.getRoutines();
    setRoutines(rs);
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { routines, reload };
}

export function useWorkoutTimers(initialRestTime = 90) {
  const [elapsed, setElapsed] = useState(0);
  const [restVisible, setRestVisible] = useState(false);
  const [restCountdown, setRestCountdown] = useState(initialRestTime);
  
  const workoutInterval = useRef(null);
  const restInterval = useRef(null);

  // Workout Timer
  useEffect(() => {
    workoutInterval.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(workoutInterval.current);
  }, []);

  // Rest Timer Cleanup
  useEffect(() => {
    return () => clearInterval(restInterval.current);
  }, []);

  const startRest = useCallback(() => {
    clearInterval(restInterval.current);
    setRestCountdown(initialRestTime);
    setRestVisible(true);
    restInterval.current = setInterval(() => {
      setRestCountdown(c => {
        if (c <= 1) {
          clearInterval(restInterval.current);
          setRestVisible(false);
          Vibration.vibrate([0, 400, 200, 400]);
          return initialRestTime;
        }
        return c - 1;
      });
    }, 1000);
  }, [initialRestTime]);

  const stopRest = useCallback(() => {
    clearInterval(restInterval.current);
    setRestVisible(false);
  }, []);

  return {
    elapsed,
    restVisible,
    restCountdown,
    setRestCountdown,
    startRest,
    stopRest,
  };
}

export function useWorkoutState(initialRoutine = null, navigation, route) {
  const [title, setTitle] = useState(initialRoutine?.name || '');
  const [exercises, setExercises] = useState(() => {
    return (initialRoutine?.exercises || []).map(e => ({
      ...e,
      sets: (e.sets?.length ? e.sets : [makeEmptySet()]).map(s => ({ ...makeEmptySet(), ...s, done: false })),
    }));
  });

  // Listen for exercises added from ExercisePicker
  useEffect(() => {
    const newExs = route.params?.addedExercises;
    if (newExs?.length) {
      setExercises(prev => {
        const ids = new Set(prev.map(exercise => exercise.id));
        const unique = newExs.filter(exercise => !ids.has(exercise.id));
        return [
          ...prev,
          ...unique.map(e => ({ ...e, sets: [makeEmptySet()], note: '' })),
        ];
      });
      navigation.setParams({ addedExercises: undefined, addedExercisesToken: undefined });
    }
  }, [route.params?.addedExercisesToken, navigation]);

  const updateSet = useCallback((exIdx, setIdx, field, value) => {
    setExercises(prev => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets] };
      next[exIdx].sets[setIdx] = { ...next[exIdx].sets[setIdx], [field]: value };
      return next;
    });
  }, []);

  const toggleDone = useCallback((exIdx, setIdx, onDone) => {
    setExercises(prev => {
      const next = [...prev];
      const isDone = !next[exIdx].sets[setIdx].done;
      
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets] };
      next[exIdx].sets[setIdx] = { ...next[exIdx].sets[setIdx], done: isDone };
      
      if (isDone && onDone) onDone();
      
      return next;
    });
  }, []);

  const cycleSetType = useCallback((exIdx, setIdx) => {
    setExercises(prev => {
      const next = [...prev];
      const cur = next[exIdx].sets[setIdx].type || 'Normal';
      const nextType = SET_TYPES[(SET_TYPES.indexOf(cur) + 1) % SET_TYPES.length];
      
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets] };
      next[exIdx].sets[setIdx] = { ...next[exIdx].sets[setIdx], type: nextType };
      
      return next;
    });
  }, []);

  const addSet = useCallback((exIdx) => {
    setExercises(prev => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets, makeEmptySet()] };
      return next;
    });
  }, []);

  const removeSet = useCallback((exIdx, setIdx) => {
    setExercises(prev => {
      const next = [...prev];
      if (next[exIdx].sets.length <= 1) return prev; // keep at least 1
      next[exIdx] = { ...next[exIdx], sets: next[exIdx].sets.filter((_, i) => i !== setIdx) };
      return next;
    });
  }, []);

  const removeExercise = useCallback((exIdx) => {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  }, []);

  return {
    title,
    setTitle,
    exercises,
    setExercises,
    updateSet,
    toggleDone,
    cycleSetType,
    addSet,
    removeSet,
    removeExercise,
  };
}
