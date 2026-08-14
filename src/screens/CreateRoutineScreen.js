import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, ChevronLeft } from 'lucide-react-native';
import { C, S } from '../constants';
import { db } from '../db';
import { useWorkoutState } from '../hooks';
import { ExerciseCard } from '../components/ExerciseCard';

export default function CreateRoutineScreen({ navigation, route }) {
  const {
    title, setTitle, exercises, updateSet, cycleSetType, addSet, removeSet, removeExercise,
  } = useWorkoutState(route.params?.routine, navigation, route);

  const confirmRemoveExercise = (index) => {
    Alert.alert('Remove exercise?', 'The exercise and its sets will be removed from this routine.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeExercise(index) },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a routine name.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Please add at least one exercise.');
      return;
    }
    const data = { name: title.trim(), exercises };
    if (route.params?.routine?.id) {
      await db.updateRoutine(route.params.routine.id, data);
    } else {
      await db.addRoutine(data);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeft color={C.hi} size={28} />
        </TouchableOpacity>
        <TextInput
          style={styles.titleInput}
          placeholder="Routine Name"
          placeholderTextColor={C.dim}
          value={title}
          onChangeText={setTitle}
          autoFocus={!route.params?.routine}
        />
        <TouchableOpacity onPress={handleSave} hitSlop={10}>
          <Text style={styles.headerBtn}>Save Routine</Text>
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
            isLogMode={false}
            onUpdateSet={updateSet}
            onCycleSetType={cycleSetType}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveExercise={confirmRemoveExercise}
          />
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ExercisePicker', {
            returnScreen: 'CreateRoutine',
            pickMode: true,
            existingExerciseIds: exercises.map(exercise => exercise.id),
          })}
        >
          <Plus color={C.primary} size={20} />
          <Text style={styles.addBtnText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 16, backgroundColor: C.bg,
  },
  titleInput: { flex: 1, color: C.hi, fontSize: 20, fontWeight: '800', marginLeft: 12 },
  headerBtn: { color: C.primary, fontSize: 16, fontWeight: '600' },
  scroll: { paddingBottom: 100 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 16, padding: 16, backgroundColor: C.primaryDim, borderRadius: S.radius,
  },
  addBtnText: { color: C.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
