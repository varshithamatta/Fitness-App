// src/screens/ProgressHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getWorkouts, getWeeklyStats, getMonthlyStats } from '../storage';
import { WorkoutSession } from '../types';

const ProgressHistoryScreen: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [weekly, setWeekly] = useState<{ workoutsCount: number; totalCalories: number; totalVolume: number } | null>(null);
  const [monthly, setMonthly] = useState<{ workoutsCount: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const [wList, wStats, mStats] = await Promise.all([
        getWorkouts(),
        getWeeklyStats(),
        getMonthlyStats(),
      ]);
      setWorkouts(wList);
      setWeekly(wStats);
      setMonthly(mStats);
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progress & History</Text>

      {weekly && (
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>This Week</Text>
            <Text style={styles.cardValue}>{weekly.workoutsCount} workouts</Text>
            <Text style={styles.cardMeta}>{weekly.totalCalories} kcal • {weekly.totalVolume} kg</Text>
          </View>
          {monthly && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>This Month</Text>
              <Text style={styles.cardValue}>{monthly.workoutsCount}</Text>
              <Text style={styles.cardMeta}>Total workouts</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>All Workouts</Text>
      {workouts.length === 0 ? (
        <Text style={styles.empty}>No workouts recorded yet.</Text>
      ) : (
        workouts.map(w => (
          <View key={w.id} style={styles.workoutCard}>
            <Text style={styles.workoutName}>{w.name}</Text>
            <Text style={styles.workoutMeta}>
              {new Date(w.date).toLocaleString()}
            </Text>
            <Text style={styles.workoutMeta}>
              Duration: {Math.round(w.duration / 60)} mins • {w.calories} kcal
            </Text>
            <Text style={styles.workoutMeta}>
              Exercises: {w.exercises.length} • Volume: {w.totalVolume} kg
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default ProgressHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 16,
  },
  cardLabel: { color: '#94a3b8', fontSize: 12 },
  cardValue: { color: '#e5e7eb', fontSize: 18, fontWeight: '700', marginTop: 4 },
  cardMeta: { color: '#64748b', fontSize: 12, marginTop: 4 },
  sectionTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  empty: { color: '#64748b' },
  workoutCard: {
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  workoutName: { color: '#e5e7eb', fontSize: 16, fontWeight: '600' },
  workoutMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
});
