import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { Activity, ArrowUpRight, CalendarDays, ChevronRight, Dumbbell, Flame, Plus, Trophy } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { C, S, formatSeconds } from '../constants';
import { db } from '../db';
import { MotionBackground } from '../components/MotionBackground';

export default function HomeScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const isFocused = useIsFocused();
  const heroEnter = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const statsEnter = useRef(new Animated.Value(0)).current;
  const markPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroEnter, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(statsEnter, { toValue: 1, duration: 650, delay: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    const markLoop = Animated.loop(Animated.sequence([
      Animated.timing(markPulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(markPulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    markLoop.start();
    return () => { loop.stop(); markLoop.stop(); };
  }, [glow, heroEnter, markPulse, statsEnter]);
  const reload = useCallback(() => db.getWorkouts().then(setWorkouts), []);
  useEffect(() => { if (isFocused) reload(); }, [isFocused, reload]);

  const stats = useMemo(() => {
    const volume = workouts.reduce((total, workout) => total + (workout.exercises || []).reduce((subtotal, ex) => subtotal + (ex.sets || []).reduce((sum, set) => sum + (parseFloat(set.kg) || 0) * (parseInt(set.reps, 10) || 0), 0), 0), 0);
    const seconds = workouts.length ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || w.durationSec || 0), 0) / workouts.length) : 0;
    return { volume, seconds };
  }, [workouts]);

  return (
    <View style={styles.container}>
      <MotionBackground />
      <Animated.View pointerEvents="none" style={[styles.ambientLine, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.9] }), transform: [{ scaleX: glow.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }] }]} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HEAVY / TRAINING LOG</Text>
            <Text style={styles.title}>Ready when you are.</Text>
          </View>
          <Animated.View style={[styles.headerMark, { transform: [{ rotate: markPulse.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] }) }, { scale: markPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}><Dumbbell color={C.accent} size={20} /></Animated.View>
        </View>

        <Animated.View style={{ opacity: heroEnter, transform: [{ translateY: heroEnter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { scale: heroEnter.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
        <TouchableOpacity style={styles.hero} onPress={() => navigation.navigate('Log', { routine: null })} activeOpacity={0.82}>
          <View pointerEvents="none" style={styles.heroGlow} />
          <View style={styles.heroIcon}><Flame color={C.hi} size={24} fill={C.hi} /></View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>NEXT SESSION</Text>
            <Text style={styles.heroTitle}>Start an empty workout</Text>
            <Text style={styles.heroSub}>Log your sets and keep your momentum.</Text>
          </View>
          <ArrowUpRight color={C.hi} size={22} />
        </TouchableOpacity>
        </Animated.View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Your progress</Text><Activity color={C.muted} size={18} /></View>
        <Animated.View style={[styles.statsGrid, { opacity: statsEnter, transform: [{ translateY: statsEnter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          <Stat icon={Dumbbell} value={String(workouts.length)} label="Workouts" />
          <Stat icon={Trophy} value={stats.volume ? `${(stats.volume / 1000).toFixed(1)}k` : '0'} label="Volume / kg" />
          <Stat icon={CalendarDays} value={workouts.length ? formatSeconds(stats.seconds) : '—'} label="Avg. duration" wide />
        </Animated.View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Recent activity</Text>{workouts.length > 0 && <Text style={styles.count}>{workouts.length} total</Text>}</View>
        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Plus color={C.accent} size={22} /></View>
            <Text style={styles.emptyTitle}>Your log starts here</Text>
            <Text style={styles.emptyText}>Complete a workout and your progress will appear on this dashboard.</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Workout')}><Text style={styles.secondaryText}>Browse routines</Text><ChevronRight color={C.accent} size={16} /></TouchableOpacity>
          </View>
        ) : workouts.slice(0, 4).map((workout) => (
          <View style={styles.activity} key={workout.id}>
            <View style={styles.activityIcon}><Dumbbell color={C.accent} size={18} /></View>
            <View style={styles.activityCopy}><Text style={styles.activityTitle}>{workout.name || workout.title || 'Workout'}</Text><Text style={styles.activityMeta}>{new Date(workout.date).toLocaleDateString()} · {formatSeconds(workout.duration || workout.durationSec || 0)}</Text></View>
            <ChevronRight color={C.muted} size={18} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Stat({ icon: Icon, value, label, wide }) {
  return <View style={[styles.stat, wide && styles.statWide]}><Icon color={C.accent} size={17} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  ambientLine: { position: 'absolute', top: 0, left: '12%', right: '12%', height: 2, backgroundColor: C.accent, borderRadius: 2, zIndex: 2, shadowColor: C.accent, shadowOpacity: 1, shadowRadius: 10 },
  scroll: { paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  eyebrow: { color: C.accent, fontSize: 11, letterSpacing: 1.2, fontWeight: '800', marginBottom: 8 },
  title: { color: C.hi, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: 0 },
  headerMark: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.accentSoft, borderWidth: 1, borderColor: '#E0FF8C72', alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOpacity: 0.35, shadowRadius: 14, elevation: 5 },
  hero: { overflow: 'hidden', backgroundColor: C.accentDark, borderRadius: S.radiusLg, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: S.section, borderWidth: 1, borderColor: '#E0FF8C8C', shadowColor: C.accent, shadowOpacity: 0.42, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  heroGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#E8FFC566', right: -78, top: -114 },
  heroIcon: { width: 46, height: 46, borderRadius: S.radiusSm, backgroundColor: 'rgba(0,0,0,0.16)', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1, marginHorizontal: 14 },
  heroKicker: { color: '#E9FFC4', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#FFF', fontSize: 17, fontWeight: '800', marginTop: 5 },
  heroSub: { color: '#F2FFE0', fontSize: 12, marginTop: 4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: C.hi, fontSize: 18, fontWeight: '800' },
  count: { color: C.muted, fontSize: 12, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: S.section },
  stat: { flex: 1, minHeight: 110, backgroundColor: '#191923E8', borderRadius: S.radius, borderWidth: 1, borderColor: C.line, padding: 14 },
  statWide: { flex: 1.18 },
  statValue: { color: C.hi, fontSize: 22, fontWeight: '800', marginTop: 12 },
  statLabel: { color: C.lo, fontSize: 11, marginTop: 4 },
  empty: { backgroundColor: '#191923E8', borderRadius: S.radiusLg, borderWidth: 1, borderColor: C.line, padding: 22, alignItems: 'center' },
  emptyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { color: C.hi, fontSize: 16, fontWeight: '800' },
  emptyText: { color: C.lo, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16, paddingVertical: 8 },
  secondaryText: { color: C.accent, fontSize: 13, fontWeight: '800' },
  activity: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: S.radius, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 8 },
  activityIcon: { width: 38, height: 38, borderRadius: S.radiusSm, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  activityCopy: { flex: 1, marginLeft: 12 },
  activityTitle: { color: C.hi, fontWeight: '700', fontSize: 15 },
  activityMeta: { color: C.lo, fontSize: 12, marginTop: 4 },
});
