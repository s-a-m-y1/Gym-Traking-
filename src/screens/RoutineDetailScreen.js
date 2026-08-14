import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Dumbbell, Play } from 'lucide-react-native';
import { C, S, EQUIPMENT_LABELS, SET_TYPE_BADGE, SET_TYPE_COLOR, formatTaxonomy } from '../constants';
import { EXERCISE_IMAGES } from '../imageMap';

export default function RoutineDetailScreen({ navigation, route }) {
  const routine = route.params?.routine || { name: 'Routine', exercises: [] };
  const exercises = routine.exercises || [];
  const setCount = exercises.reduce((total, exercise) => total + (exercise.sets?.length || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
          <ChevronLeft color={C.hi} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Routine Details</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ROUTINE</Text>
        <Text style={styles.title}>{routine.name}</Text>
        <Text style={styles.summary}>{exercises.length} exercises · {setCount} sets</Text>

        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('Log', { routine })}>
          <Play color={C.hi} size={17} fill={C.hi} />
          <Text style={styles.startText}>Start Workout</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Exercises</Text>
        {exercises.map((exercise, exerciseIndex) => (
          <View style={styles.exerciseCard} key={`${exercise.id}-${exerciseIndex}`}>
            <View style={styles.exerciseHeader}>
              <Image source={EXERCISE_IMAGES[exercise.id]} style={styles.image} resizeMode="cover" />
              <View style={styles.exerciseCopy}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.equipment}>{EQUIPMENT_LABELS[exercise.equipment] || formatTaxonomy(exercise.equipment) || 'Bodyweight'}</Text>
              </View>
              <View style={styles.number}><Text style={styles.numberText}>{exerciseIndex + 1}</Text></View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableLabel, styles.setColumn]}>SET</Text>
              <Text style={styles.tableLabel}>KG</Text>
              <Text style={styles.tableLabel}>REPS</Text>
            </View>
            {(exercise.sets?.length ? exercise.sets : [{ type: 'Normal', kg: '', reps: '' }]).map((set, setIndex) => (
              <View style={styles.setRow} key={setIndex}>
                <View style={styles.setColumn}>
                  <Text style={[styles.setNumber, set.type !== 'Normal' && { color: SET_TYPE_COLOR[set.type] }]}>
                    {SET_TYPE_BADGE[set.type] || setIndex + 1}
                  </Text>
                </View>
                <Text style={styles.setValue}>{set.kg || '—'}</Text>
                <Text style={styles.setValue}>{set.reps || '—'}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.page, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  iconBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { color: C.hi, fontSize: 16, fontWeight: '800' },
  scroll: { padding: S.page, paddingBottom: 40 },
  eyebrow: { color: C.accent, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  title: { color: C.hi, fontSize: 28, lineHeight: 34, fontWeight: '800', marginTop: 8 },
  summary: { color: C.lo, fontSize: 13, marginTop: 6 },
  startBtn: { marginTop: 20, marginBottom: 28, height: 50, borderRadius: S.radius, backgroundColor: C.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  startText: { color: C.hi, fontSize: 15, fontWeight: '800' },
  sectionTitle: { color: C.hi, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  exerciseCard: { backgroundColor: C.card, borderRadius: S.radius, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 12 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  image: { width: 48, height: 48, borderRadius: S.radiusSm },
  exerciseCopy: { flex: 1, marginLeft: 12 },
  exerciseName: { color: C.hi, fontSize: 16, fontWeight: '800' },
  equipment: { color: C.lo, fontSize: 12, marginTop: 4 },
  number: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: C.accent, fontSize: 12, fontWeight: '800' },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  tableLabel: { flex: 1, color: C.muted, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  setColumn: { width: 54, flex: 0 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12 },
  setNumber: { color: C.hi, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  setValue: { flex: 1, color: C.hi, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
