// src/storage/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, Goal } from '../types';

const STORAGE_KEYS = {
  WORKOUTS: 'fittrack_workouts',
  GOALS: 'fittrack_goals',
} as const;

// Helpers
async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key}`, e);
    return fallback;
  }
}

async function setJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key}`, e);
  }
}

// ---------- Workouts ----------
export async function saveWorkout(workout: WorkoutSession): Promise<void> {
  const workouts = await getWorkouts();
  const updated = [workout, ...workouts];
  await setJson(STORAGE_KEYS.WORKOUTS, updated);
}

export async function getWorkouts(): Promise<WorkoutSession[]> {
  return getJson<WorkoutSession[]>(STORAGE_KEYS.WORKOUTS, []);
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  const filtered = workouts.filter(w => w.id !== id);
  await setJson(STORAGE_KEYS.WORKOUTS, filtered);
}

// ---------- Goals ----------
export async function saveGoals(goals: Goal[]): Promise<void> {
  await setJson(STORAGE_KEYS.GOALS, goals);
}

export async function getGoals(): Promise<Goal[]> {
  return getJson<Goal[]>(STORAGE_KEYS.GOALS, []);
}

// ---------- Stats ----------
export async function getWeeklyStats() {
  const workouts = await getWorkouts();
  const today = new Date();
  const weekStart = new Date(today);
  // Start of week (Sunday-based, similar to your web logic)
  weekStart.setDate(today.getDate() - today.getDay());

  const thisWeek = workouts.filter(w => {
    const d = new Date(w.date);
    return d >= weekStart;
  });

  const totalCalories = thisWeek.reduce((sum, w) => sum + w.calories, 0);
  const totalVolume = thisWeek.reduce((sum, w) => sum + w.totalVolume, 0);

  return {
    workoutsCount: thisWeek.length,
    totalCalories,
    totalVolume,
  };
}

export async function getMonthlyStats() {
  const workouts = await getWorkouts();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const thisMonth = workouts.filter(w => {
    const d = new Date(w.date);
    return d >= monthStart;
  });

  return {
    workoutsCount: thisMonth.length,
  };
}
