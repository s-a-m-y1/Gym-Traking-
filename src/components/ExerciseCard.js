import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { MoreHorizontal, Plus, Check, X } from 'lucide-react-native';
import { C, S, SET_TYPE_BADGE, SET_TYPE_COLOR, EQUIPMENT_LABELS, formatTaxonomy } from '../constants';
import { EXERCISE_IMAGES } from '../imageMap';

const BODY_EMOJI = {
  chest: '💪', back: '🏋️', shoulders: '🎯', arms: '💪',
  legs: '🦵', core: '🔥', cardio: '🏃', full_body: '🤸',
};

export function ExerciseCard({
  ex, exIdx,
  isLogMode = false,
  onUpdateSet,
  onToggleDone,
  onCycleSetType,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.exEmoji, EXERCISE_IMAGES[ex.id] && { backgroundColor: 'transparent' }]}>
          {EXERCISE_IMAGES[ex.id] ? (
            <Image source={EXERCISE_IMAGES[ex.id]} style={styles.exImage} resizeMode="cover" />
          ) : (
            <Text style={styles.exEmojiText}>{BODY_EMOJI[ex.body_part] || '⚡'}</Text>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.exName}>{ex.name}</Text>
          <Text style={styles.exEquip}>{EQUIPMENT_LABELS[ex.equipment] || formatTaxonomy(ex.equipment) || 'Bodyweight'}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => onRemoveExercise(exIdx)}>
          <MoreHorizontal color={C.hi} size={24} />
        </TouchableOpacity>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { width: 40 }]}>Set</Text>
        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>kg</Text>
        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Reps</Text>
        <Text style={[styles.thText, { width: 40, textAlign: 'center' }]}>{isLogMode ? <Check color={C.dim} size={16} /> : ''}</Text>
      </View>

      {/* Sets */}
      {ex.sets.map((set, setIdx) => {
        const isDone = set.done;
        return (
          <View key={setIdx} style={[styles.tableRow, isDone && styles.tableRowDone]}>
            {/* Set Type / Number */}
            <TouchableOpacity
              style={styles.setNumberBtn}
              onPress={() => onCycleSetType?.(exIdx, setIdx)}
              disabled={!onCycleSetType}
            >
              {set.type === 'Normal' ? (
                <Text style={styles.setNumber}>{setIdx + 1}</Text>
              ) : (
                <Text style={[styles.setTypeBadge, { color: SET_TYPE_COLOR[set.type] }]}>
                  {SET_TYPE_BADGE[set.type]}
                </Text>
              )}
            </TouchableOpacity>

            {/* KG Input */}
            <View style={styles.inputCell}>
              <TextInput
                style={[styles.input, isDone && styles.inputDone]}
                keyboardType="decimal-pad"
                placeholder="-"
                placeholderTextColor={C.dim}
                value={set.kg || ''}
                onChangeText={(val) => onUpdateSet(exIdx, setIdx, 'kg', val)}
                editable={!isDone}
              />
            </View>

            {/* Reps Input */}
            <View style={styles.inputCell}>
              <TextInput
                style={[styles.input, isDone && styles.inputDone]}
                keyboardType="number-pad"
                placeholder="-"
                placeholderTextColor={C.dim}
                value={set.reps || ''}
                onChangeText={(val) => onUpdateSet(exIdx, setIdx, 'reps', val)}
                editable={!isDone}
              />
            </View>

            {/* Action Button: Checkbox (LogMode) OR Remove Set (CreateMode) */}
            {isLogMode ? (
              <TouchableOpacity
                style={[styles.checkBtn, isDone && styles.checkBtnDone]}
                onPress={() => onToggleDone(exIdx, setIdx)}
              >
                {isDone && <Check color="#fff" size={16} strokeWidth={3} />}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.checkBtn}
                onPress={() => onRemoveSet(exIdx, setIdx)}
              >
                <X color={C.error} size={20} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* Add Set Button */}
      <TouchableOpacity style={styles.addSetBtn} onPress={() => onAddSet(exIdx)}>
        <Plus color={C.dim} size={16} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: S.radius, borderWidth: 1, borderColor: C.line },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  exEmoji: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: C.raised, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  exImage: { width: 46, height: 46, borderRadius: 12 },
  exEmojiText: { fontSize: 22 },
  exName: { color: C.hi, fontSize: 16, fontWeight: '800' },
  exEquip: { color: C.dim, fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  moreBtn: { padding: 4 },
  
  tableHeader: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 },
  thText: { color: C.dim, fontSize: 13, fontWeight: '600' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 4 },
  tableRowDone: { opacity: 0.6 },
  
  setNumberBtn: { width: 40, height: 32, justifyContent: 'center' },
  setNumber: { color: C.hi, fontSize: 15, fontWeight: '700' },
  setTypeBadge: { fontSize: 15, fontWeight: '800' },
  
  inputCell: { flex: 1, paddingHorizontal: 6 },
  input: {
    backgroundColor: C.raised, color: C.hi, borderRadius: 6,
    height: 36, textAlign: 'center', fontSize: 16, fontWeight: '600',
  },
  inputDone: { backgroundColor: 'transparent' },
  
  checkBtn: {
    width: 40, height: 32, borderRadius: 6,
    backgroundColor: C.raised, justifyContent: 'center', alignItems: 'center',
  },
  checkBtnDone: { backgroundColor: C.primary },
  
  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 4 },
  addSetText: { color: C.dim, fontSize: 15, fontWeight: '600', marginLeft: 6 },
});
