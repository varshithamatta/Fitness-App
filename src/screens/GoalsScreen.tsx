// src/screens/GoalsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Goal, GoalType } from '../types';
import { getGoals, saveGoals } from '../storage';

const goalTypes: { value: GoalType; label: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
];

const GoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('weight_loss');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [unit, setUnit] = useState('kg');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const load = async () => {
      const stored = await getGoals();
      setGoals(stored);
    };
    load();
  }, []);

  const getProgress = (goal: Goal) => {
    if (goal.target === 0) return 0;
    // Simple linear progress; adjust if you want weight-loss inversion as in web
    return Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
  };

  const getDaysRemaining = (deadlineStr: string) => {
    if (!deadlineStr) return null;
    const today = new Date();
    const deadlineDate = new Date(deadlineStr);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const resetForm = () => {
    setTitle('');
    setType('weight_loss');
    setTarget('');
    setCurrent('');
    setUnit('kg');
    setDeadline('');
    setDescription('');
  };

  const handleSaveGoals = async (list: Goal[]) => {
    setGoals(list);
    await saveGoals(list);
  };

  const addGoal = async () => {
    if (!title.trim() || !target) {
      Alert.alert('Missing fields', 'Please enter title and target value.');
      return;
    }
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      target: Number(target),
      current: Number(current) || 0,
      unit: unit || '',
      deadline: deadline || '',
    };
    const updated = [newGoal, ...goals];
    await handleSaveGoals(updated);
    resetForm();
  };

  const removeGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    await handleSaveGoals(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Goals</Text>
      <Text style={styles.subtitle}>Set and track your fitness goals.</Text>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Goal</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Lose 5kg"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Goal Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {goalTypes.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.typeChip,
                type === g.value && styles.typeChipActive,
              ]}
              onPress={() => setType(g.value)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  type === g.value && styles.typeChipTextActive,
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Target</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
              placeholder="e.g., 5"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Current</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={current}
              onChangeText={setCurrent}
              placeholder="e.g., 70"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="kg / reps / km"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={deadline}
              onChangeText={setDeadline}
              placeholder="2025-12-31"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Why this goal matters to you..."
          placeholderTextColor="#64748b"
        />

        <TouchableOpacity style={styles.saveButton} onPress={addGoal}>
          <Text style={styles.saveButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <Text style={styles.sectionTitle}>Active Goals</Text>
      {goals.length === 0 ? (
        <Text style={styles.empty}>No goals yet. Create your first one!</Text>
      ) : (
        goals.map(goal => {
          const progress = getProgress(goal);
          const daysRemaining = getDaysRemaining(goal.deadline ?? '');
          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalMeta}>
                    {goal.current}/{goal.target} {goal.unit}
                  </Text>
                  {daysRemaining !== null && (
                    <Text style={styles.goalMeta}>
                      {daysRemaining >= 0
                        ? `${daysRemaining} days remaining`
                        : `${Math.abs(daysRemaining)} days past deadline`}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeGoal(goal.id)}>
                  <Text style={styles.removeText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>

              {goal.description && (
                <Text style={styles.goalDesc}>{goal.description}</Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default GoalsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#64748b', marginTop: 4, marginBottom: 12 },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  label: { color: '#94a3b8', fontSize: 12, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#020617',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  row: { flexDirection: 'row', marginTop: 4 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginRight: 8,
  },
  typeChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeChipText: { color: '#94a3b8', fontSize: 12 },
  typeChipTextActive: { color: '#e5e7eb', fontWeight: '600' },
  saveButton: {
    marginTop: 12,
    borderRadius: 9999,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  empty: { color: '#64748b' },
  goalCard: {
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600' },
  goalMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  goalDesc: { color: '#cbd5f5', fontSize: 13, marginTop: 6 },
  removeText: { color: '#f97316', fontSize: 12 },
  progressBar: {
    marginTop: 10,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#020617',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#22c55e',
  },
  progressText: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
});
