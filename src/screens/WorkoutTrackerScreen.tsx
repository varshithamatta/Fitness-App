// src/screens/WorkoutTrackerScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { saveWorkout } from '../storage';
import { WorkoutSession } from '../types';

interface SetItem {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface ExerciseItem {
  id: string;
  name: string;
  sets: SetItem[];
}

const popularExercises = [
  'Bench Press',
  'Squats',
  'Deadlift',
  'Shoulder Press',
  'Barbell Row',
  'Pull-ups',
  'Dumbbell Curl',
  'Tricep Dips',
];

const WorkoutTrackerScreen: React.FC = () => {
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');

  // Timer handling
  useEffect(() => {
    if (workoutStarted) {
      timerRef.current = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workoutStarted]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const addExercise = (name: string) => {
    if (!name.trim()) return;
    const ex: ExerciseItem = {
      id: Date.now().toString() + Math.random(),
      name: name.trim(),
      sets: [
        {
          id: Date.now().toString() + '-1',
          reps: 10,
          weight: 0,
          completed: false,
        },
      ],
    };
    setExercises(prev => [...prev, ex]);
    setNewExerciseName('');
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: Date.now().toString() + '-set',
                  reps: 10,
                  weight: 0,
                  completed: false,
                },
              ],
            }
          : ex,
      ),
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: number,
  ) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(s =>
                s.id === setId ? { ...s, [field]: value } : s,
              ),
            }
          : ex,
      ),
    );
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(s =>
                s.id === setId ? { ...s, completed: !s.completed } : s,
              ),
            }
          : ex,
      ),
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
          : ex,
      ),
    );
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const startWorkout = () => {
    if (workoutStarted) return;
    setWorkoutStarted(true);
  };

  const finishWorkoutPrompt = () => {
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise to save your workout');
      return;
    }
    Alert.prompt
      ? Alert.prompt(
          'Save Workout',
          'Enter a name for this workout',
          async name => {
            await saveAndFinishWorkout(name || 'Workout');
          },
        )
      : // Android has no Alert.prompt; fallback
        Alert.alert(
          'Save Workout',
          'Workout will be saved with default name',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save',
              onPress: async () => await saveAndFinishWorkout('Workout'),
            },
          ],
        );
  };

  const saveAndFinishWorkout = async (nameFromPrompt?: string) => {
    const totalVolume = exercises.reduce(
      (total, ex) =>
        total +
        ex.sets
          .filter(s => s.completed)
          .reduce((sum, s) => sum + s.reps * s.weight, 0),
      0,
    );
    const completedSets = exercises.reduce(
      (total, ex) => total + ex.sets.filter(s => s.completed).length,
      0,
    );
    const estimatedCalories = completedSets * 5; // simple heuristic

    const workout: WorkoutSession = {
      id: Date.now().toString(),
      name: nameFromPrompt || workoutName || 'Workout',
      date: new Date().toISOString(),
      duration: workoutTime,
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets
          .filter(s => s.completed)
          .map(s => ({
            reps: s.reps,
            weight: s.weight,
          })),
      })),
      totalVolume,
      calories: estimatedCalories,
    };

    await saveWorkout(workout);
    Alert.alert('Saved', 'Workout saved successfully 💪');

    setWorkoutStarted(false);
    setWorkoutTime(0);
    setExercises([]);
    setWorkoutName('');
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0,
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerLabel}>
            {workoutStarted ? 'Workout in Progress' : 'Ready to Train'}
          </Text>
          <Text style={styles.headerTime}>{formatTime(workoutTime)}</Text>
        </View>
        <View style={styles.headerStats}>
          <View>
            <Text style={styles.headerStatLabel}>Sets</Text>
            <Text style={styles.headerStatValue}>
              {completedSets}/{totalSets}
            </Text>
          </View>
          <View>
            <Text style={styles.headerStatLabel}>Exercises</Text>
            <Text style={styles.headerStatValue}>{exercises.length}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={startWorkout}>
          <Text style={styles.primaryButtonText}>
            {workoutStarted ? 'Resume' : 'Start Workout'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.finishButton]}
          onPress={finishWorkoutPrompt}
          disabled={!workoutStarted}
        >
          <Text style={styles.primaryButtonText}>Finish & Save</Text>
        </TouchableOpacity>
      </View>

      {/* Add exercise */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Exercise</Text>
        <View style={styles.addRow}>
          <TextInput
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            placeholder="Custom exercise name"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => addExercise(newExerciseName)}
          >
            <Text style={styles.smallButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {popularExercises.map(ex => (
            <TouchableOpacity
              key={ex}
              style={styles.tag}
              onPress={() => addExercise(ex)}
            >
              <Text style={styles.tagText}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Exercise list */}
      {exercises.map(exercise => (
        <View key={exercise.id} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
          {exercise.sets.map(set => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setLabel}>Set</Text>
              <View style={styles.setInputs}>
                <View style={styles.setInputGroup}>
                  <Text style={styles.setInputLabel}>Reps</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(set.reps)}
                    onChangeText={val =>
                      updateSet(
                        exercise.id,
                        set.id,
                        'reps',
                        Number(val) || 0,
                      )
                    }
                    style={styles.setInput}
                  />
                </View>
                <View style={styles.setInputGroup}>
                  <Text style={styles.setInputLabel}>Weight</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(set.weight)}
                    onChangeText={val =>
                      updateSet(
                        exercise.id,
                        set.id,
                        'weight',
                        Number(val) || 0,
                      )
                    }
                    style={styles.setInput}
                  />
                </View>
              </View>
              <View style={styles.setActions}>
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    set.completed && styles.completeButtonActive,
                  ]}
                  onPress={() => toggleSetComplete(exercise.id, set.id)}
                >
                  <Text style={styles.completeButtonText}>
                    {set.completed ? 'Done' : 'Complete'}
                  </Text>
                </TouchableOpacity>
                {exercise.sets.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeSet(exercise.id, set.id)}
                  >
                    <Text style={styles.removeText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => addSet(exercise.id)}
          >
            <Text style={styles.addSetText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default WorkoutTrackerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16 },
  headerCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLabel: { color: '#bfdbfe', fontSize: 12 },
  headerTime: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 },
  headerStats: { alignItems: 'flex-end' },
  headerStatLabel: { color: '#bfdbfe', fontSize: 12 },
  headerStatValue: { color: '#fff', fontSize: 18, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  primaryButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  finishButton: { backgroundColor: '#f97316' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  section: { marginTop: 24 },
  sectionTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e5e7eb',
  },
  smallButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  smallButtonText: { color: '#fff', fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: {
    borderRadius: 9999,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { color: '#bfdbfe', fontSize: 12 },
  exerciseCard: {
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    marginTop: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: { color: '#e5e7eb', fontWeight: '600', fontSize: 16 },
  removeText: { color: '#f97316', fontSize: 12 },
  setRow: {
    marginTop: 8,
    backgroundColor: '#0b1120',
    borderRadius: 12,
    padding: 8,
  },
  setLabel: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  setInputs: { flexDirection: 'row', gap: 8 },
  setInputGroup: { flex: 1 },
  setInputLabel: { color: '#64748b', fontSize: 11 },
  setInput: {
    marginTop: 2,
    backgroundColor: '#020617',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#e5e7eb',
  },
  setActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  completeButtonActive: { backgroundColor: '#22c55e' },
  completeButtonText: { color: '#bbf7d0', fontSize: 12, fontWeight: '600' },
  addSetButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  addSetText: { color: '#60a5fa', fontSize: 13, fontWeight: '500' },
});
