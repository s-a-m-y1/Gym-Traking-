import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Share, MoreHorizontal, Trophy, TrendingUp } from 'lucide-react-native';
import { C, S, BODY_PART_LABELS, EQUIPMENT_LABELS, formatDate, formatSeconds, formatTaxonomy } from '../constants';
import { db } from '../db';
import { EXERCISE_IMAGES } from '../imageMap';

const METRICS = ['Heaviest Weight', 'Best Set Volume', 'Session Volume', 'Total Reps'];

export default function ExerciseDetailScreen({ navigation, route }) {
  const ex = route.params?.exercise || { name: 'Exercise', body_part: '', equipment: '' };
  const [tab, setTab] = useState('Summary');
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
  const [history, setHistory] = useState([]);
  const [prs, setPrs] = useState({});
  const imageSource = EXERCISE_IMAGES[ex.id];

  useEffect(() => {
    db.getExerciseHistory(ex.id).then(setHistory);
    db.getPRs().then(all => setPrs(all[ex.id] || {}));
  }, [ex.id]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeft color={C.hi} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{ex.name}</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Share color={C.lo} size={20} />
          <MoreHorizontal color={C.lo} size={20} />
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {['Summary', 'History'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {tab === 'Summary' ? (
          <>
            <View style={styles.hero}>
              {imageSource ? (
                <Image source={imageSource} style={styles.heroImage} resizeMode="contain" />
              ) : (
                <Text style={styles.heroLetter}>{ex.name[0]}</Text>
              )}
            </View>

            {/* Muscle + equipment tags */}
            <View style={styles.tags}>
              {ex.body_part && <View style={styles.tag}><Text style={styles.tagText}>{BODY_PART_LABELS[ex.body_part] || formatTaxonomy(ex.body_part)}</Text></View>}
              {ex.equipment && <View style={styles.tag}><Text style={styles.tagText}>{EQUIPMENT_LABELS[ex.equipment] || formatTaxonomy(ex.equipment)}</Text></View>}
            </View>

            {/* Metric chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}
              contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
              {METRICS.map(m => (
                <TouchableOpacity key={m} style={[styles.metricChip, selectedMetric === m && styles.metricChipActive]} onPress={() => setSelectedMetric(m)}>
                  <Text style={[styles.metricChipText, selectedMetric === m && styles.metricChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Chart placeholder */}
            <View style={styles.chartCard}>
              <View style={styles.chartArea}>
                {history.length === 0
                  ? <Text style={styles.noDataText}>Log this exercise to see progress</Text>
                  : <Text style={styles.noDataText}>Chart — {history.length} session{history.length > 1 ? 's' : ''}</Text>
                }
              </View>
            </View>

            {/* Records */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Trophy color={C.yellow} size={18} />
                <Text style={styles.sectionTitle}>Records</Text>
              </View>
              <RecordRow label="Heaviest Weight" value={prs.heaviest ? `${prs.heaviest} kg` : '—'} />
              <RecordRow label="Best Set Volume" value={prs.bestSetVol ? `${prs.bestSetVol} kg` : '—'} />
            </View>

            {/* Instructions */}
            {ex.instructions?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                {ex.instructions.map((step, i) => (
                  <View key={i} style={styles.instrRow}>
                    <Text style={styles.instrNum}>{i + 1}</Text>
                    <Text style={styles.instrText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {ex.tips?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tips</Text>
                {ex.tips.map((tip, i) => (
                  <Text key={i} style={styles.tipText}>• {tip}</Text>
                ))}
              </View>
            )}
          </>
        ) : (
          /* History tab */
          history.length === 0 ? (
            <View style={styles.empty}>
              <TrendingUp color={C.muted} size={48} />
              <Text style={styles.emptyText}>No history yet.</Text>
              <Text style={styles.emptySubText}>Log a workout with this exercise to see your history here.</Text>
            </View>
          ) : (
            history.map((h, i) => (
              <View key={i} style={styles.historyCard}>
                <Text style={styles.historyDate}>{formatDate(h.date)}</Text>
                {h.sets.map((s, j) => (
                  <Text key={j} style={styles.historySet}>Set {j+1}: {s.kg || '—'} kg × {s.reps || '—'}</Text>
                ))}
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

function RecordRow({ label, value }) {
  return (
    <View style={styles.recordRow}>
      <Text style={styles.recordLabel}>{label}</Text>
      <Text style={styles.recordValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.page, paddingTop: 24, paddingBottom: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.line, gap: 12 },
  headerTitle: { flex: 1, color: C.hi, fontSize: 17, fontWeight: '700' },
  tabBar: { flexDirection: 'row', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.line },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.accent },
  tabText: { color: C.lo, fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: C.hi },
  hero: { height: 240, backgroundColor: C.raised, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroLetter: { color: C.muted, fontSize: 80, fontWeight: '800' },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: C.raised, borderRadius: S.radiusSm, paddingHorizontal: 12, paddingVertical: 7 },
  tagText: { color: C.lo, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  metricsScroll: { marginBottom: 16 },
  metricChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: S.radiusSm, backgroundColor: C.raised },
  metricChipActive: { backgroundColor: C.accentSoft },
  metricChipText: { color: C.lo, fontSize: 13, fontWeight: '600' },
  metricChipTextActive: { color: C.accent },
  chartCard: { backgroundColor: C.card, borderRadius: S.radius, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.line, height: 160, justifyContent: 'center', alignItems: 'center' },
  chartArea: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  noDataText: { color: C.muted, fontSize: 14 },
  section: { backgroundColor: C.card, borderRadius: S.radius, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.line },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { color: C.hi, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  recordLabel: { color: C.lo, fontSize: 14 },
  recordValue: { color: C.hi, fontSize: 14, fontWeight: '700' },
  instrRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  instrNum: { color: C.accent, fontWeight: '800', fontSize: 14, width: 20 },
  instrText: { flex: 1, color: C.lo, fontSize: 14, lineHeight: 20 },
  tipText: { color: C.lo, fontSize: 14, lineHeight: 22, marginBottom: 4 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: C.hi, fontSize: 18, fontWeight: '700' },
  emptySubText: { color: C.lo, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  historyCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.line },
  historyDate: { color: C.hi, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  historySet: { color: C.lo, fontSize: 14, lineHeight: 22 },
});
