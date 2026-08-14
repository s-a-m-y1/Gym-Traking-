import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { Settings, Dumbbell, BarChart2, Award, Calendar, Clock, ChevronRight, Activity } from 'lucide-react-native';
import { C, S, formatDate, formatSeconds } from '../constants';
import { db } from '../db';
import { useIsFocused } from '@react-navigation/native';
import { MotionBackground } from '../components/MotionBackground';

export default function ProfileScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const isFocused = useIsFocused();
  const reveal = useRef(new Animated.Value(0)).current;
  const avatarPulse = useRef(new Animated.Value(0)).current;

  const reload = useCallback(async () => {
    const ws = await db.getWorkouts();
    setWorkouts(ws);
  }, []);

  useEffect(() => {
    if (isFocused) reload();
  }, [isFocused, reload]);
  useEffect(() => {
    if (isFocused) {
      reveal.setValue(0);
      Animated.timing(reveal, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [isFocused, reveal]);
  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(avatarPulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(avatarPulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, [avatarPulse]);

  const totalVol = workouts.reduce((sum, w) => {
    return sum + (w.exercises || []).reduce((s2, ex) => {
      return s2 + (ex.sets || []).reduce((s3, s) => s3 + (parseFloat(s.kg)||0) * (parseInt(s.reps)||0), 0);
    }, 0);
  }, 0);

  const menuItems = [
    { label: 'Exercises', Icon: Dumbbell, action: () => navigation.navigate('ExercisePicker', { pickMode: false }) },
    { label: 'Workout History', Icon: Clock, action: null },
    { label: 'Statistics', Icon: BarChart2, action: null },
    { label: 'Measures', Icon: Activity, action: null },
    { label: 'Workout Calendar', Icon: Calendar, action: null },
  ];

  return (
    <View style={styles.container}>
      <MotionBackground tone="mint" />
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>YOUR TRAINING</Text><Text style={styles.title}>Profile</Text></View>
        <TouchableOpacity>
          <Settings color={C.lo} size={22} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* User card */}
        <View style={styles.userCard}>
          <Animated.View style={[styles.avatar, { transform: [{ scale: avatarPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]}><Text style={styles.avatarText}>ME</Text></Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>My Profile</Text>
            <Text style={styles.userSub}>{workouts.length} workouts logged</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{workouts.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{totalVol > 0 ? `${(totalVol/1000).toFixed(1)}t` : '—'}</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>
              {workouts.length > 0
                ? formatSeconds(Math.round(workouts.reduce((s,w)=>s+(w.duration || w.durationSec || 0),0)/workouts.length))
                : '—'}
            </Text>
            <Text style={styles.statLabel}>Avg. Duration</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuGroup}>
          {menuItems.map(({ label, Icon, action }) => (
            <TouchableOpacity
              key={label}
              style={styles.menuRow}
              onPress={action || undefined}
              disabled={!action}
              activeOpacity={action ? 0.7 : 1}
            >
              <View style={styles.menuIconWrap}>
                <Icon color={action ? C.accent : C.muted} size={18} />
              </View>
              <Text style={[styles.menuLabel, !action && { color: C.muted }]}>{label}</Text>
              {action && <ChevronRight color={C.muted} size={16} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent workouts */}
        {workouts.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent Workouts</Text>
            {workouts.slice(0, 5).map(w => (
              <View key={w.id} style={styles.workoutCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutTitle}>{w.title}</Text>
                  <Text style={styles.workoutMeta}>
                    {formatDate(w.date)} · {formatSeconds(w.duration || w.durationSec || 0)}
                  </Text>
                </View>
                <ChevronRight color={C.muted} size={16} />
              </View>
            ))}
          </>
        )}
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 22 },
  eyebrow: { color: C.accent, fontSize: 10, letterSpacing: 1.1, fontWeight: '800', marginBottom: 7 },
  title: { color: C.hi, fontSize: 28, fontWeight: '800' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.accentDark, borderWidth: 2, borderColor: '#E8FFC5', justifyContent: 'center', alignItems: 'center', shadowColor: C.accent, shadowOpacity: 0.55, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 7 },
  avatarText: { color: C.hi, fontWeight: '800', fontSize: 20 },
  userName: { color: C.hi, fontSize: 20, fontWeight: '700' },
  userSub: { color: C.lo, fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#191923E8', borderRadius: S.radius, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  statVal: { color: C.hi, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: C.lo, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  menuGroup: { backgroundColor: '#191923E8', borderRadius: S.radiusLg, marginBottom: 28, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  menuIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.raised, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, color: C.hi, fontSize: 16, fontWeight: '600' },
  sectionLabel: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  workoutCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: S.radius, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  workoutTitle: { color: C.hi, fontSize: 15, fontWeight: '700' },
  workoutMeta: { color: C.lo, fontSize: 12, marginTop: 4 },
});
