// src/storage/workoutStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutExerciseSet {
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;          // ISO string
  duration: number;      // in seconds
  exercises: WorkoutExercise[];
  totalVolume: number;
  calories: number;
}

export interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;      // ISO date
}

const STORAGE_KEYS = {
  WORKOUTS: 'fittrack_workouts',
  GOALS: 'fittrack_goals',
};

async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('AsyncStorage read error', e);
    return fallback;
  }
}

async function setJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('AsyncStorage write error', e);
  }
}

// Workouts
export async function saveWorkout(workout: WorkoutSession): Promise<void> {
  const workouts = await getWorkouts();
  workouts.unshift(workout);
  await setJson(STORAGE_KEYS.WORKOUTS, workouts);
}

export async function getWorkouts(): Promise<WorkoutSession[]> {
  return getJson<WorkoutSession[]>(STORAGE_KEYS.WORKOUTS, []);
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  const filtered = workouts.filter(w => w.id !== id);
  await setJson(STORAGE_KEYS.WORKOUTS, filtered);
}

// Goals
export async function saveGoals(goals: Goal[]): Promise<void> {
  await setJson(STORAGE_KEYS.GOALS, goals);
}

export async function getGoals(): Promise<Goal[]> {
  return getJson<Goal[]>(STORAGE_KEYS.GOALS, []);
}

// Weekly stats (similar to your web version)
export async function getWeeklyStats() {
  const workouts = await getWorkouts();
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const thisWeekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= weekStart;
  });

  const totalCalories = thisWeekWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalVolume = thisWeekWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);

  return {
    workoutsCount: thisWeekWorkouts.length,
    totalCalories,
    totalVolume,
  };
}

export async function getMonthlyStats() {
  const workouts = await getWorkouts();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const thisMonthWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= monthStart;
  });

  return {
    workoutsCount: thisMonthWorkouts.length,
  };
}
