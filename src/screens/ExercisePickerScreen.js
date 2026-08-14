import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Image
} from 'react-native';
import { X, Search, Check, ChevronRight, SlidersHorizontal } from 'lucide-react-native';
import { C, S, BODY_PART_LABELS, EQUIPMENT_LABELS, formatTaxonomy } from '../constants';
import { db } from '../db';
import { EXERCISE_IMAGES } from '../imageMap';

const BODY_PARTS = ['', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];
const EQUIPMENTS = ['', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell'];

// Emoji per category
const BODY_EMOJI = {
  chest: '💪', back: '🏋️', shoulders: '🎯', arms: '💪',
  legs: '🦵', upper_legs: '🦵', lower_legs: '🦵', core: '🔥',
  cardio: '❤️', other: '⚡', olympic: '🏅', full_body: '🌟',
};

export default function ExercisePickerScreen({ navigation, route }) {
  const pickMode = route.params?.pickMode !== false;
  const returnScreen = route.params?.returnScreen;
  const existingIds = useMemo(
    () => new Set(route.params?.existingExerciseIds || []),
    [route.params?.existingExerciseIds]
  );

  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState([]);
  const [bodyPartFilter, setBodyPartFilter] = useState('');
  const [equipFilter, setEquipFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = Boolean(bodyPartFilter || equipFilter);

  useEffect(() => {
    db.getExercises().then(setExercises);
  }, []);

  const filtered = useMemo(() => {
    const searchResults = query.trim() ? exercises
      .map(exercise => ({ exercise, score: scoreExercise(exercise, query) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
      .map(result => result.exercise) : exercises;

    return searchResults.filter(e => {
      const matchBP = matchesBodyPart(e, bodyPartFilter);
      const matchEq = matchesEquipment(e, equipFilter);
      return matchBP && matchEq;
    });
  }, [bodyPartFilter, equipFilter, exercises, query]);

  const toggle = useCallback((ex) => {
    if (existingIds.has(ex.id)) return;
    setSelected(prev =>
      prev.find(s => s.id === ex.id)
        ? prev.filter(s => s.id !== ex.id)
        : [...prev, ex]
    );
  }, [existingIds]);

  const handleAdd = () => {
    if (!selected.length) return;
    if (returnScreen) {
      const state = navigation.getState();
      const target = [...state.routes].reverse().find(item => item.name === returnScreen);
      const params = {
        ...(target?.params || {}),
        addedExercises: selected,
        addedExercisesToken: Date.now(),
      };
      if (navigation.popTo) navigation.popTo(returnScreen, params);
      else navigation.navigate({ name: returnScreen, params, merge: true });
    } else {
      navigation.goBack();
    }
  };

  const renderItem = ({ item: ex }) => {
    const isSel = !!selected.find(s => s.id === ex.id);
    const isExisting = existingIds.has(ex.id);
    const emoji = BODY_EMOJI[ex.body_part] || '⚡';
    const imgSource = EXERCISE_IMAGES[ex.id];
    
    return (
      <TouchableOpacity
        style={[styles.row, isSel && styles.rowSelected, isExisting && styles.rowExisting]}
        onPress={() => pickMode ? toggle(ex) : navigation.navigate('ExerciseDetail', { exercise: ex })}
        disabled={pickMode && isExisting}
        activeOpacity={0.7}
      >
        <View style={[styles.thumb, imgSource && { backgroundColor: 'transparent' }]}> 
          {imgSource ? (
            <Image source={imgSource} style={{ width: 48, height: 48, borderRadius: 12 }} resizeMode="cover" />
          ) : (
            <Text style={styles.thumbEmoji}>{emoji}</Text>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.exName}>{ex.name}</Text>
          <Text style={styles.exSub}>
            {BODY_PART_LABELS[ex.body_part] || formatTaxonomy(ex.body_part)}
            {ex.equipment ? ` · ${EQUIPMENT_LABELS[ex.equipment] || formatTaxonomy(ex.equipment)}` : ''}
          </Text>
        </View>

        {!pickMode ? <ChevronRight color={C.muted} size={18} /> : isExisting ? <Text style={styles.addedText}>Added</Text> : (
          <View style={[styles.selector, isSel && styles.selectorActive]}>
            {isSel && <Check color={C.hi} size={15} strokeWidth={3} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.headerBtn}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{pickMode ? 'Add Exercises' : 'Exercises'}</Text>
          {pickMode && selected.length > 0 && (
            <Text style={styles.selectionCount}>{selected.length} selected</Text>
          )}
        </View>
        <View style={{ width: 56 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search color={C.muted} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercise..."
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color={C.muted} size={16} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(f => !f)}
        >
          <SlidersHorizontal color={showFilters ? C.accent : C.lo} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
            {BODY_PARTS.map(bp => (
              <TouchableOpacity
                key={bp || '__all__'}
                style={[styles.pill, bp === bodyPartFilter && styles.pillActive]}
                onPress={() => setBodyPartFilter(bp === bodyPartFilter ? '' : bp)}
              >
                <Text style={[styles.pillText, bp === bodyPartFilter && styles.pillTextActive]}>
                  {bp ? (BODY_PART_LABELS[bp] || bp) : 'All Muscles'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
            {EQUIPMENTS.map(eq => (
              <TouchableOpacity
                key={eq || '__all__'}
                style={[styles.pill, eq === equipFilter && styles.pillActive]}
                onPress={() => setEquipFilter(eq === equipFilter ? '' : eq)}
              >
                <Text style={[styles.pillText, eq === equipFilter && styles.pillTextActive]}>
                  {eq ? (EQUIPMENT_LABELS[eq] || eq) : 'All Equipment'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.sectionLabel}>
        {query.trim() ? `Results · ${filtered.length}` : hasFilters ? `Filtered · ${filtered.length}` : `All Exercises · ${filtered.length}`}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: selected.length > 0 ? 110 : 20 }}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search color={C.muted} size={30} />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptyText}>Try another search or clear the active filters.</Text>
            {hasFilters && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => { setBodyPartFilter(''); setEquipFilter(''); }}>
                <Text style={styles.clearBtnText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Add button */}
      {pickMode && selected.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>
              Add {selected.length} Exercise{selected.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function matchesBodyPart(exercise, filter) {
  if (!filter) return true;
  if (filter === 'cardio') return exercise.category === 'cardio';
  const groups = {
    arms: ['arms', 'upper_arms', 'lower_arms'],
    legs: ['legs', 'upper_legs', 'lower_legs'],
  };
  return (groups[filter] || [filter]).includes(exercise.body_part);
}

function matchesEquipment(exercise, filter) {
  if (!filter) return true;
  if (filter === 'bodyweight') return exercise.is_bodyweight === true || !exercise.equipment;
  if (filter === 'machine') return /machine|pec_deck|leg_press|leg_extension|leg_curl|hip_abduction|hip_adduction/.test(exercise.equipment || '');
  return exercise.equipment === filter;
}

const SEARCH_ALIASES = {
  bb: 'barbell', db: 'dumbbell', kb: 'kettlebell', bw: 'bodyweight',
  bi: 'biceps', bicep: 'biceps', tri: 'triceps', tricep: 'triceps',
  lat: 'lats', delt: 'deltoid', delts: 'deltoid',
  pullup: 'pull up', pullups: 'pull up', chinup: 'chin up', chinups: 'chin up',
  pushup: 'push up', pushups: 'push up',
  rdl: 'romanian deadlift', ohp: 'overhead press',
};

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function expandQuery(value) {
  const normalized = normalizeSearch(value);
  return normalized.split(' ').map(token => SEARCH_ALIASES[token] || token).join(' ');
}

function scoreExercise(exercise, rawQuery) {
  const query = expandQuery(rawQuery);
  if (!query) return 1;

  const name = normalizeSearch(exercise.name);
  const compactName = name.replace(/ /g, '');
  const queryTokens = query.split(' ').filter(Boolean);
  const nameTokens = name.split(' ');
  const primary = normalizeSearch((exercise.primary_muscles || []).join(' '));
  const secondary = normalizeSearch((exercise.secondary_muscles || []).join(' '));
  const equipment = normalizeSearch(`${exercise.equipment || ''} ${formatTaxonomy(exercise.equipment)}`);
  const category = normalizeSearch(`${exercise.category || ''} ${exercise.body_part || ''} ${BODY_PART_LABELS[exercise.body_part] || ''}`);
  const allMetadata = `${primary} ${secondary} ${equipment} ${category}`;

  let score = 0;
  if (name === query) score += 1000;
  else if (name.startsWith(query)) score += 800;
  else if (name.includes(query)) score += 650;
  else if (compactName.includes(query.replace(/ /g, ''))) score += 620;

  for (const token of queryTokens) {
    const exactNameToken = nameTokens.includes(token);
    const prefixNameToken = nameTokens.some(word => word.startsWith(token));
    const fuzzyNameToken = token.length >= 4 && nameTokens.some(word => isCloseWord(token, word));
    const metadataMatch = allMetadata.includes(token);
    if (!exactNameToken && !prefixNameToken && !fuzzyNameToken && !metadataMatch) return 0;
    if (exactNameToken) score += 140;
    else if (prefixNameToken) score += 105;
    else if (fuzzyNameToken) score += 70;
    else if (primary.includes(token)) score += 45;
    else if (equipment.includes(token)) score += 32;
    else if (category.includes(token)) score += 24;
    else score += 12;
  }
  return score;
}

function isCloseWord(query, candidate) {
  if (Math.abs(query.length - candidate.length) > 2) return false;
  const maxDistance = query.length >= 7 ? 2 : 1;
  const previous = Array.from({ length: candidate.length + 1 }, (_, index) => index);
  for (let i = 1; i <= query.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= candidate.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (query[i - 1] === candidate[j - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[candidate.length] <= maxDistance;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 14,
    backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  headerTitle: { color: C.hi, fontSize: 17, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  selectionCount: { color: C.accent, fontSize: 11, fontWeight: '700', marginTop: 2 },
  headerBtn: { color: C.accent, fontSize: 16, fontWeight: '600', minWidth: 56, textAlign: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, backgroundColor: C.card },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.raised, borderRadius: S.radius,
    paddingHorizontal: 12, height: 44, gap: 8,
  },
  searchInput: { flex: 1, color: C.hi, fontSize: 16 },
  filterToggle: {
    width: 44, height: 44, borderRadius: S.radius,
    backgroundColor: C.raised, justifyContent: 'center', alignItems: 'center',
  },
  filterToggleActive: { backgroundColor: C.accentSoft },
  filtersWrap: { borderBottomWidth: 1, borderBottomColor: C.line, paddingTop: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: S.radiusSm, backgroundColor: C.raised },
  pillActive: { backgroundColor: C.accent },
  pillText: { color: C.lo, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: C.hi },
  sectionLabel: {
    color: C.muted, fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.page, paddingVertical: 13 },
  rowSelected: { backgroundColor: C.accentSoft },
  rowExisting: { opacity: 0.46 },
  thumb: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.raised, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  thumbEmoji: { fontSize: 22 },
  exName: { color: C.hi, fontSize: 16, fontWeight: '600' },
  exSub: { color: C.lo, fontSize: 12, marginTop: 3 },
  selector: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.muted, justifyContent: 'center', alignItems: 'center',
  },
  selectorActive: { backgroundColor: C.accent, borderColor: C.accent },
  addedText: { color: C.lo, fontSize: 12, fontWeight: '700' },
  sep: { height: 1, backgroundColor: C.line, marginLeft: 76 },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 72 },
  emptyTitle: { color: C.hi, fontSize: 16, fontWeight: '800', marginTop: 14 },
  emptyText: { color: C.lo, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  clearBtn: { marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, borderRadius: S.radiusSm, backgroundColor: C.accentSoft },
  clearBtnText: { color: C.accent, fontSize: 13, fontWeight: '800' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 36,
    backgroundColor: C.card + 'F5', borderTopWidth: 1, borderTopColor: C.line,
  },
  addBtn: {
    backgroundColor: C.accent, borderRadius: S.radius,
    paddingVertical: 18, alignItems: 'center',
  },
  addBtnText: { color: C.hi, fontSize: 17, fontWeight: '700' },
});
