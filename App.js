import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, Platform, Animated, View, StyleSheet } from 'react-native';
import { Home, Dumbbell, UserRound } from 'lucide-react-native';
import { C } from './src/constants';

import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import LogScreen from './src/screens/LogScreen';
import ExercisePickerScreen from './src/screens/ExercisePickerScreen';
import ExerciseDetailScreen from './src/screens/ExerciseDetailScreen';
import RoutineDetailScreen from './src/screens/RoutineDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ Icon, color, focused }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: focused ? 1 : 0.9, friction: 5, tension: 150, useNativeDriver: true }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={[styles.tabIcon, focused && styles.tabIconActive, { transform: [{ scale }] }]}>
      <Icon color={color} size={20} strokeWidth={focused ? 2.7 : 2.1} />
      {focused && <View style={styles.tabSignal} />}
    </Animated.View>
  );
}

// Full theme object that satisfies all React Navigation requirements
const MyTheme = {
  dark: true,
  colors: {
    primary: C.accent,
    background: C.bg,
    card: C.card,
    text: C.hi,
    border: C.line,
    notification: C.accent,
  },
  fonts: {
    regular: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '400' },
    medium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '500' },
    bold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700' },
    heavy: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '900' },
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D1214F2',
          borderTopColor: '#34423C',
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 12,
          paddingTop: 10,
          elevation: 18,
          shadowColor: '#000000',
          shadowOpacity: 0.42,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -6 },
        },
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.lo,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 1 },
        tabBarItemStyle: { borderRadius: 14, marginHorizontal: 6 },
        tabBarActiveBackgroundColor: 'transparent',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} /> }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ tabBarIcon: ({ color, focused }) => <TabIcon Icon={Dumbbell} color={color} focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, focused }) => <TabIcon Icon={UserRound} color={color} focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 38, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: C.accentSoft, borderWidth: 1, borderColor: '#DFFF8A66' },
  tabSignal: { position: 'absolute', bottom: -7, width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, shadowColor: C.accent, shadowOpacity: 0.95, shadowRadius: 6, elevation: 4 },
});

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
        <NavigationContainer theme={MyTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="CreateRoutine"
            component={CreateRoutineScreen}
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Log"
            component={LogScreen}
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="ExercisePicker"
            component={ExercisePickerScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="ExerciseDetail"
            component={ExerciseDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="RoutineDetail"
            component={RoutineDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
