// src/types/index.ts
export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;      // ISO string
  duration: number;  // seconds
  exercises: WorkoutExercise[];
  totalVolume: number;
  calories: number;
}

export type GoalType = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  deadline: string; // ISO date
}
