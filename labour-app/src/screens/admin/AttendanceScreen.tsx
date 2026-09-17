import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, Btn } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Labour {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string;
  joiningDate: string | null;
}

interface AttendanceRecord {
  id: number;
  labourId: number;
  attendanceDate: string;
  status: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS: Record<string, string> = {
  P: colors.emerald[500],
  A: colors.red[500],
  H: colors.orange[500],
  L: colors.purple[500],
  W: colors.slate[400],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AttendanceScreen() {
  const navigation = useNavigation<any>();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [search, setSearch] = useState('');
  const [labours, setLabours] = useState<Labour[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [initialGrid, setInitialGrid] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDay = useMemo(() => getFirstDayOfWeek(year, month), [year, month]);

  const buildEmptyGrid = useCallback((labourList: Labour[], y: number, m: number, dim: number) => {
    const grid: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    labourList.forEach((l) => {
      for (let d = 1; d <= dim; d++) {
        const dt = new Date(y, m, d);
        grid[`${l.id}-${d}`] = dt > today ? 'A' : '';
      }
    });
    return grid;
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [labourRes, attRes] = await Promise.all([
        api.get('/admin/labours', { params: { page: 0, size: 100 } }),
        api.get('/admin/attendance/month', { params: { year, month: month + 1 } }),
      ]);
      const labourList = unwrap<Page<Labour>>(labourRes).content;
      setLabours(labourList);

      const attList = unwrap<AttendanceRecord[]>(attRes);
      setAttendance(attList);

      const dim = getDaysInMonth(year, month);
      const grid = buildEmptyGrid(labourList, year, month, dim);
      attList.forEach((a) => {
        const dayNum = new Date(a.attendanceDate).getDate();
        const s = a.status === 'PRESENT' ? 'P' : a.status === 'HALF_DAY' ? 'H' : a.status === 'LEAVE' ? 'L' : 'A';
        grid[`${a.labourId}-${dayNum}`] = s;
      });
      setChanges(grid);
      setInitialGrid({ ...grid });
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
  }, [year, month, buildEmptyGrid]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchAll();
    setLoading(false);
  }, [fetchAll]);

  React.useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const toggle = useCallback((labourId: number, day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(year, month, day) > today) return;

    setChanges((prev) => {
      const key = `${labourId}-${day}`;
      const cur = prev[key] || 'A';
      const next = cur === 'P' ? 'A' : 'P';
      return { ...prev, [key]: next };
    });
  }, [year, month]);

  const markAllPresent = useCallback(() => {
    const grid: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    labours.forEach((l) => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        grid[`${l.id}-${d}`] = dt <= today ? 'P' : 'A';
      }
    });
    setChanges(grid);
  }, [labours, daysInMonth, year, month]);

  const saveAttendance = useCallback(async () => {
    setSaving(true);
    try {
      const items: { labourId: number; attendanceDate: string; status: string }[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      Object.entries(changes).forEach(([key, status]) => {
        if (!status) return;
        const [labourIdStr, dayStr] = key.split('-');
        const labourId = Number(labourIdStr);
        const day = Number(dayStr);
        const dt = new Date(year, month, day);
        if (dt > today) return;
        const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        const apiStatus = status === 'P' ? 'PRESENT' : status === 'H' ? 'HALF_DAY' : status === 'L' ? 'LEAVE' : 'ABSENT';
        items.push({ labourId, attendanceDate: iso, status: apiStatus });
      });
      if (items.length === 0) {
        Alert.alert('Info', 'No attendance to save');
        setSaving(false);
        return;
      }
      await api.post('/admin/attendance/bulk', { items });
      Alert.alert('Saved', 'Attendance updated successfully');
      await fetchAll();
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
    setSaving(false);
  }, [changes, year, month, fetchAll]);

  const filteredLabours = useMemo(() => {
    const q = search.toLowerCase();
    return labours.filter((l) =>
      `${l.firstName} ${l.lastName} ${l.employeeCode}`.toLowerCase().includes(q)
    );
  }, [labours, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Attendance" currentRoute="Attendance" onNavigate={(route) => navigation.navigate(route)} />
    <ScrollView style={s.root} contentContainerStyle={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}>
      <Text style={s.title}>Attendance Register</Text>

      <View style={s.monthRow}>
        <TouchableOpacity onPress={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} style={s.navBtn}>
          <Text style={s.navBtnText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={s.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} style={s.navBtn}>
          <Text style={s.navBtnText}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={s.search}
        placeholder="Search labour..."
        placeholderTextColor={colors.slate[400]}
        value={search}
        onChangeText={setSearch}
      />

      <Btn onPress={saveAttendance} disabled={saving} style={s.markBtn}>
        {saving ? 'Saving...' : 'Mark Attendance'}
      </Btn>

      {loading ? (
        <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 30 }} />
      ) : filteredLabours.length === 0 ? (
        <Text style={s.empty}>No labours found</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={s.tableHeader}>
              <View style={s.nameCol}>
                <Text style={s.thText}>Labour</Text>
              </View>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <View key={d} style={s.dayCol}>
                  <Text style={s.thText}>{d}</Text>
                </View>
              ))}
            </View>
            {filteredLabours.map((l) => (
              <View key={l.id} style={s.tableRow}>
                <View style={s.nameCol}>
                  <Text style={s.nameText} numberOfLines={1}>{l.firstName} {l.lastName}</Text>
                  <Text style={s.desigText} numberOfLines={1}>{l.employeeCode}</Text>
                </View>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const key = `${l.id}-${d}`;
                  const val = changes[key] || '';
                  const isFuture = new Date(year, month, d) > new Date();
                  const color = STATUS_COLORS[val] || colors.slate[200];
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[s.dayCell, { backgroundColor: val ? color + '20' : colors.slate[50] }]}
                      onPress={() => toggle(l.id, d)}
                      disabled={isFuture}
                    >
                      <Text style={[s.dayText, { color: val ? color : colors.slate[400] }]}>{val || '-'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy950, marginBottom: 12 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brand600, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -2 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.slate[800], minWidth: 100, textAlign: 'center' },
  search: { borderWidth: 1, borderColor: colors.slate[300], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.slate[900], backgroundColor: '#fff', marginBottom: 10 },
  markBtn: { marginBottom: 12 },
  empty: { textAlign: 'center', color: colors.slate[500], marginTop: 30 },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.navy950, borderRadius: 8, overflow: 'hidden', marginBottom: 2 },
  thText: { fontSize: 10, fontWeight: '700', color: '#fff', textAlign: 'center' },
  nameCol: { width: 120, paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center' },
  dayCol: { width: 34, alignItems: 'center', paddingVertical: 8 },
  tableRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 6, marginBottom: 2, borderWidth: 1, borderColor: colors.slate[100] },
  nameText: { fontSize: 11, fontWeight: '600', color: colors.slate[800] },
  desigText: { fontSize: 9, color: colors.slate[500], marginTop: 1 },
  dayCell: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, margin: 1 },
  dayText: { fontSize: 11, fontWeight: '700' },
});
