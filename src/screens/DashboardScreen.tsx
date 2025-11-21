// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getWeeklyStats, getMonthlyStats, getWorkouts } from '../storage';
import { WorkoutSession } from '../types';

const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState<{ workoutsCount: number; totalCalories: number; totalVolume: number } | null>(null);
  const [monthly, setMonthly] = useState<{ workoutsCount: number } | null>(null);
  const [recent, setRecent] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [w, m, workouts] = await Promise.all([
        getWeeklyStats(),
        getMonthlyStats(),
        getWorkouts(),
      ]);
      setWeekly(w);
      setMonthly(m);
      setRecent(workouts.slice(0, 3));
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !weekly || !monthly) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Weekly Overview */}
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Workouts</Text>
          <Text style={styles.cardValue}>{weekly.workoutsCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Calories</Text>
          <Text style={styles.cardValue}>{weekly.totalCalories}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Volume (kg)</Text>
          <Text style={styles.cardValue}>{weekly.totalVolume}</Text>
        </View>
      </View>

      {/* Monthly */}
      <Text style={styles.sectionTitle}>This Month</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Workouts</Text>
        <Text style={styles.cardValue}>{monthly.workoutsCount}</Text>
      </View>

      {/* Recent Workouts */}
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      {recent.length === 0 ? (
        <Text style={styles.emptyText}>No workouts logged yet. Start your first workout!</Text>
      ) : (
        recent.map(w => (
          <View key={w.id} style={styles.workoutCard}>
            <Text style={styles.workoutName}>{w.name}</Text>
            <Text style={styles.workoutMeta}>
              {new Date(w.date).toLocaleString()} • {Math.round(w.duration / 60)} mins • {w.calories} kcal
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

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  loadingText: { color: '#e5e7eb', marginTop: 8 },
  sectionTitle: { color: '#e5e7eb', fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
  },
  cardLabel: { color: '#94a3b8', fontSize: 12 },
  cardValue: { color: '#e5e7eb', fontSize: 20, fontWeight: '700', marginTop: 4 },
  emptyText: { color: '#64748b', marginTop: 4 },
  workoutCard: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  workoutName: { color: '#e5e7eb', fontSize: 16, fontWeight: '600' },
  workoutMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
});
