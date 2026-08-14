export const C = {
  bg: '#080B0D',
  card: '#12181A',
  raised: '#1A2325',
  raisedStrong: '#263134',
  hi: '#F4F8F4',
  lo: '#AEBAB3',
  muted: '#728078',
  dim: '#728078',
  line: '#2B3934',
  accent: '#C8FF3D',
  accentDark: '#89B900',
  accentSoft: '#C8FF3D26',
  accentText: '#FFFFFF',
  primary: '#C8FF3D',
  primaryDim: '#C8FF3D26',
  danger: '#FF5C5C',
  error: '#FF5C5C',
  dangerSoft: '#FF5C5C18',
  yellow: '#FFD166',
  green: '#48E6AE',
  cyan: '#39D8FF',
  orange: '#FF9B52',
};

export const S = {
  page: 20,
  section: 28,
  card: 16,
  radius: 16,
  radiusSm: 10,
  radiusLg: 24,
};

export const SET_TYPES = ['Normal', 'Warmup', 'Failure', 'Dropset'];
export const SET_TYPE_BADGE = { Normal: null, Warmup: 'W', Failure: 'F', Dropset: 'D' };
export const SET_TYPE_COLOR = {
  Normal: C.muted,
  Warmup: C.yellow,
  Failure: C.danger,
  Dropset: C.green,
};

export const BODY_PART_LABELS = {
  core: 'Core', arms: 'Arms', back: 'Back', chest: 'Chest',
  upper_arms: 'Arms', lower_arms: 'Forearms',
  legs: 'Legs', upper_legs: 'Legs', lower_legs: 'Legs',
  shoulders: 'Shoulders', other: 'Other', olympic: 'Olympic',
  full_body: 'Full Body', cardio: 'Cardio'
};

export const EQUIPMENT_LABELS = {
  barbell: 'Barbell', dumbbell: 'Dumbbell', machine: 'Machine',
  cable: 'Cable', kettlebell: 'Kettlebell', bodyweight: 'Bodyweight',
  plate: 'Plate', resistance_band: 'Band', other: 'Other', pull_up_bar: 'Pull-Up Bar'
};

export function formatTaxonomy(value) {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

export function formatTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function makeEmptySet() {
  return { type: 'Normal', kg: '', reps: '', done: false };
}
