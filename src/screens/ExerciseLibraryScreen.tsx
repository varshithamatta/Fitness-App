// src/screens/ExerciseLibraryScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  description: string;
}

const EXERCISES: Exercise[] = [
  { id: '1', name: 'Bench Press', category: 'Chest', muscle: 'Pectorals', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Compound exercise for building chest strength.' },
  { id: '2', name: 'Squat', category: 'Legs', muscle: 'Quadriceps', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Foundational lower-body strength exercise.' },
  { id: '3', name: 'Deadlift', category: 'Back', muscle: 'Posterior Chain', difficulty: 'Advanced', equipment: 'Barbell', description: 'Full-body compound movement targeting the entire posterior chain.' },
  { id: '4', name: 'Overhead Press', category: 'Shoulders', muscle: 'Deltoids', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Compound press for building shoulder strength.' },
  { id: '5', name: 'Lat Pulldown', category: 'Back', muscle: 'Lats', difficulty: 'Beginner', equipment: 'Machine', description: 'Vertical pulling movement for lat development.' },
  // ...add more based on your web list
];

const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

const ExerciseLibraryScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () =>
      EXERCISES.filter(ex => {
        const matchCategory = category === 'All' || ex.category === category;
        const query = search.toLowerCase();
        const matchSearch =
          ex.name.toLowerCase().includes(query) ||
          ex.muscle.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query);
        return matchCategory && matchSearch;
      }),
    [search, category],
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Exercise Library</Text>
      <Text style={styles.subtitle}>Browse by name, muscle group, or equipment.</Text>

      <TextInput
        placeholder="Search exercises..."
        placeholderTextColor="#64748b"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[styles.chipText, category === cat && styles.chipTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map(ex => (
        <View key={ex.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{ex.name}</Text>
            <Text style={styles.badge}>{ex.difficulty}</Text>
          </View>
          <Text style={styles.meta}>
            {ex.category} • {ex.muscle} • {ex.equipment}
          </Text>
          <Text style={styles.desc}>{ex.description}</Text>
        </View>
      ))}
      {filtered.length === 0 && (
        <Text style={styles.empty}>No exercises found for this filter.</Text>
      )}
    </ScrollView>
  );
};

export default ExerciseLibraryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#64748b', marginTop: 4, marginBottom: 12 },
  search: {
    backgroundColor: '#0f172a',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#e5e7eb',
  },
  categoryRow: { marginVertical: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  chipTextActive: { color: '#e5e7eb', fontWeight: '600' },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600' },
  badge: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    color: '#dbeafe',
    fontSize: 11,
  },
  meta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  desc: { color: '#cbd5f5', fontSize: 13, marginTop: 4 },
  empty: { color: '#64748b', marginTop: 16, textAlign: 'center' },
});
