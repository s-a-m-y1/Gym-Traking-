import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Timer, Plus, Check } from 'lucide-react-native';
import { C, S, formatSeconds } from '../constants';
import { db } from '../db';
import { useWorkoutState, useWorkoutTimers } from '../hooks';
import { ExerciseCard } from '../components/ExerciseCard';

export default function LogScreen({ navigation, route }) {
  const routine = route.params?.routine;
  const {
    title, setTitle, exercises, updateSet, toggleDone, cycleSetType, addSet, removeSet, removeExercise,
  } = useWorkoutState(routine, navigation, route);
  
  const {
    elapsed, restVisible, restCountdown, setRestCountdown, startRest, stopRest
  } = useWorkoutTimers(90);

  const confirmRemoveExercise = (index) => {
    Alert.alert('Remove exercise?', 'Completed and entered sets for this exercise will be discarded.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeExercise(index) },
    ]);
  };

  const handleFinish = async () => {
    if (exercises.length === 0) {
      Alert.alert('Empty', 'Add some exercises first!');
      return;
    }
    await db.saveWorkout({ name: title || 'Workout', exercises, duration: elapsed });
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeft color={C.hi} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Workout Name"
            placeholderTextColor={C.dim}
          />
          <Text style={styles.timerText}>{formatSeconds(elapsed)}</Text>
        </View>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.id + exIdx}
            ex={ex}
            exIdx={exIdx}
            isLogMode={true}
            onUpdateSet={updateSet}
            onToggleDone={(idx, sIdx) => toggleDone(idx, sIdx, startRest)}
            onCycleSetType={cycleSetType}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveExercise={confirmRemoveExercise}
          />
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ExercisePicker', {
            returnScreen: 'Log',
            pickMode: true,
            existingExerciseIds: exercises.map(exercise => exercise.id),
          })}
        >
          <Plus color={C.primary} size={20} />
          <Text style={styles.addBtnText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rest Timer Modal */}
      <Modal visible={restVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rest</Text>
            <Text style={styles.modalTime}>{formatSeconds(restCountdown)}</Text>
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.timeBtn} onPress={() => setRestCountdown(c => Math.max(0, c - 15))}>
                <Text style={styles.timeBtnText}>-15s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={stopRest}>
                <Text style={styles.skipBtnText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timeBtn} onPress={() => setRestCountdown(c => c + 15)}>
                <Text style={styles.timeBtnText}>+15s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 16, backgroundColor: C.bg,
  },
  headerTitleWrap: { flex: 1, marginHorizontal: 12 },
  titleInput: { color: C.hi, fontSize: 20, fontWeight: '800' },
  timerText: { color: C.dim, fontSize: 13, marginTop: 2, fontWeight: '600' },
  finishBtn: { backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: S.radius },
  finishText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { paddingBottom: 100 },
  
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 16, padding: 14, backgroundColor: C.primaryDim, borderRadius: 12,
  },
  addBtnText: { color: C.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.raised, padding: 24, borderTopLeftRadius: S.radius, borderTopRightRadius: S.radius, alignItems: 'center' },
  modalTitle: { color: C.dim, fontSize: 16, fontWeight: '600' },
  modalTime: { color: C.hi, fontSize: 48, fontWeight: '800', marginVertical: 16 },
  modalRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' },
  timeBtn: { padding: 16, backgroundColor: C.bg, borderRadius: 12 },
  timeBtnText: { color: C.hi, fontSize: 16, fontWeight: '600' },
  skipBtn: { paddingHorizontal: 32, paddingVertical: 16, backgroundColor: C.primary, borderRadius: 12 },
  skipBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
