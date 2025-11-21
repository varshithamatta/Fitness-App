// src/navigation/RootNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutTrackerScreen from '../screens/WorkoutTrackerScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import ProgressHistoryScreen from '../screens/ProgressHistoryScreen';
import GoalsScreen from '../screens/GoalsScreen';

export type RootTabParamList = {
  Dashboard: undefined;
  Workout: undefined;
  Exercises: undefined;
  Progress: undefined;
  Goals: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#0f172a' },
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#e5e7eb',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Workout') iconName = 'barbell-outline';
          else if (route.name === 'Exercises') iconName = 'library-outline';
          else if (route.name === 'Progress') iconName = 'trending-up-outline';
          else if (route.name === 'Goals') iconName = 'flag-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutTrackerScreen} />
      <Tab.Screen name="Exercises" component={ExerciseLibraryScreen} />
      <Tab.Screen name="Progress" component={ProgressHistoryScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
    </Tab.Navigator>
  );
};
