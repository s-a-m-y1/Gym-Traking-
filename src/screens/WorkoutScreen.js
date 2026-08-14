import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RefreshCw, FolderPlus, Search, ClipboardList, MoreHorizontal, Play, ChevronRight } from 'lucide-react-native';
import { C, S } from '../constants';
import { db } from '../db';
import { useIsFocused } from '@react-navigation/native';
import { MotionBackground } from '../components/MotionBackground';

export default function WorkoutScreen({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      enter.setValue(0);
      Animated.timing(enter, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [enter, isFocused]);

  const reload = useCallback(async () => {
    const rs = await db.getRoutines();
    setRoutines(rs);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isFocused) reload();
  }, [isFocused, reload]);

  const handleRoutineMenu = (r) => {
    Alert.alert(r.name, '', [
      { text: 'Edit Routine', onPress: () => navigation.navigate('CreateRoutine', { routine: r }) },
      { text: 'Delete Routine', style: 'destructive', onPress: async () => { await db.deleteRoutine(r.id); reload(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <MotionBackground tone="orange" />
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>TRAINING SPACE</Text><Text style={styles.title}>Workouts</Text></View>
        <TouchableOpacity onPress={reload}>
          <RefreshCw color={C.lo} size={20} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Start empty */}
        <TouchableOpacity style={styles.startEmpty} onPress={() => navigation.navigate('Log', { routine: null })}>
          <Play color={C.hi} size={18} fill={C.hi} />
          <Text style={styles.startEmptyText}>Start Empty Workout</Text>
        </TouchableOpacity>

        {/* Routines section */}
        <View style={styles.sectionHeader}>
          <FolderPlus color={C.accent} size={20} />
          <Text style={styles.sectionTitle}>Routines</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareBtn} onPress={() => navigation.navigate('CreateRoutine')}>
            <ClipboardList color={C.accent} size={28} />
            <Text style={styles.squareBtnText}>New Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareBtn}>
            <Search color={C.lo} size={28} />
            <Text style={[styles.squareBtnText, { color: C.lo }]}>Explore</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.myRoutinesLabel}>My Routines ({routines.length})</Text>

        {routines.length === 0 && !loading && (
          <View style={styles.empty}>
            <ClipboardList color={C.muted} size={48} />
            <Text style={styles.emptyText}>No routines yet. Create one to get started.</Text>
          </View>
        )}

        {routines.map(r => {
          const exerciseNames = r.exercises?.map(e => e.name).slice(0, 3).join(', ') || '';
          const more = (r.exercises?.length || 0) - 3;
          return (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('RoutineDetail', { routine: r })} activeOpacity={0.7}>
                  <Text style={styles.cardTitle}>{r.name}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {exerciseNames}{more > 0 ? ` +${more} more` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRoutineMenu(r)} hitSlop={10}>
                  <MoreHorizontal color={C.lo} size={20} />
                </TouchableOpacity>
              </View>

              {/* Exercise count */}
              <Text style={styles.exerciseCount}>{r.exercises?.length || 0} exercises</Text>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => navigation.navigate('Log', { routine: r })}
              >
                <Play color={C.accent} size={16} fill={C.accent} />
                <Text style={styles.startBtnText}>Start Routine</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 22, backgroundColor: C.bg },
  eyebrow: { color: C.accent, fontSize: 10, letterSpacing: 1.1, fontWeight: '800', marginBottom: 7 },
  title: { color: C.hi, fontSize: 28, fontWeight: '800' },
  startEmpty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.accentDark, borderRadius: S.radiusLg, padding: 18, marginBottom: 28, borderWidth: 1, borderColor: '#E0FF8C8C', shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  startEmptyText: { color: C.hi, fontSize: 16, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: C.hi, fontSize: 18, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  squareBtn: { flex: 1, backgroundColor: '#191923E8', borderRadius: S.radius, padding: 18, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.line },
  squareBtnText: { color: C.accent, fontSize: 14, fontWeight: '700' },
  myRoutinesLabel: { color: C.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: { color: C.lo, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: '#191923F2', borderRadius: S.radius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.line },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { color: C.hi, fontSize: 18, fontWeight: '700' },
  cardSubtitle: { color: C.lo, fontSize: 13, marginTop: 4 },
  exerciseCount: { color: C.muted, fontSize: 12, fontWeight: '600', marginBottom: 14 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.accentSoft, borderRadius: 12, paddingVertical: 14 },
  startBtnText: { color: C.accent, fontSize: 16, fontWeight: '700' },
});
