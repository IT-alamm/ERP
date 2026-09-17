import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, Stat } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Profile {
  joiningDate: string;
}

interface AttendanceRecord {
  labourId: number;
  attendanceDate: string;
  status: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function MyAttendanceScreen() {
  const navigation = useNavigation<any>();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [joiningDate, setJoiningDate] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, attendanceRes] = await Promise.all([
        api.get('/labour/profile'),
        api.get('/labour/attendance/month', { params: { year, month } }),
      ]);
      setJoiningDate(unwrap<Profile>(profileRes).joiningDate);
      setRecords(unwrap<AttendanceRecord[]>(attendanceRes));
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  }, [year, month]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  React.useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const joinDate = joiningDate ? new Date(joiningDate) : null;
  const today = new Date();

  const recordMap: Record<string, string> = {};
  records.forEach(r => { recordMap[r.attendanceDate] = r.status; });

  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const totalDays = presentCount + absentCount;
  const attendancePct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getStatus = (day: number): { color: string; label: string; dimmed: boolean } => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);

    if (joinDate && dateObj < joinDate) return { color: colors.slate[300], label: '—', dimmed: true };
    if (dateObj > today) return { color: colors.slate[200], label: '—', dimmed: true };

    const status = recordMap[dateStr];
    if (status === 'PRESENT') return { color: colors.emerald[500], label: 'P', dimmed: false };
    if (status === 'ABSENT') return { color: colors.red[500], label: 'A', dimmed: false };
    return { color: colors.slate[300], label: '—', dimmed: true };
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Attendance" currentRoute="Attendance" onNavigate={(route) => navigation.navigate(route)} />
      <ScrollView
        style={s.root}
        contentContainerStyle={s.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />
        ) : error ? (
          <Card style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
          </Card>
        ) : (
          <>

          <View style={s.navRow}>
            <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
              <Text style={s.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthLabel}>{MONTHS[month - 1]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
              <Text style={s.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={s.summaryRow}>
            <View style={[s.summaryBadge, { backgroundColor: colors.emerald[50] }]}>
              <Text style={[s.summaryBadgeText, { color: colors.emerald[600] }]}>P: {presentCount}</Text>
            </View>
            <View style={[s.summaryBadge, { backgroundColor: colors.red[50] }]}>
              <Text style={[s.summaryBadgeText, { color: colors.red[600] }]}>A: {absentCount}</Text>
            </View>
            <View style={[s.summaryBadge, { backgroundColor: colors.brand600 + '15' }]}>
              <Text style={[s.summaryBadgeText, { color: colors.brand600 }]}>{attendancePct}%</Text>
            </View>
          </View>

          <Card style={s.calendarCard}>
            <View style={s.dayLabelsRow}>
              {DAYS_IN_WEEK.map(d => (
                <Text key={d} style={s.dayLabel}>{d}</Text>
              ))}
            </View>
            <View style={s.calendarGrid}>
              {calendarDays.map((day, idx) => {
                if (day === null) return <View key={`empty-${idx}`} style={s.dayCell} />;
                const status = getStatus(day);
                return (
                  <View key={day} style={s.dayCell}>
                    <View style={[s.dayDot, { backgroundColor: status.color }]}>
                      <Text style={[s.dayDotText, status.dimmed && { opacity: 0.5 }]}>{status.label}</Text>
                    </View>
                    <Text style={[s.dayNum, status.dimmed && { opacity: 0.4 }]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brand600, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 20, color: '#fff', fontWeight: '700' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.slate[900] },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryBadge: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  summaryBadgeText: { fontSize: 13, fontWeight: '700' },
  grid: { gap: 10, marginBottom: 16 },
  calendarCard: { marginBottom: 16, padding: 12 },
  dayLabelsRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.slate[500], textTransform: 'uppercase' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  dayDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayDotText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  dayNum: { fontSize: 9, color: colors.slate[600], marginTop: 2 },
  registerCard: { marginBottom: 16 },
  registerTitle: { fontSize: 11, fontWeight: '700', color: colors.slate[900], textTransform: 'uppercase', letterSpacing: 0.8, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  registerHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  registerHeadText: { fontSize: 10, fontWeight: '700', color: colors.slate[500], textTransform: 'uppercase', letterSpacing: 0.6 },
  registerRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.slate[50] },
  registerCell: { fontSize: 13, color: colors.slate[700] },
  registerStatusCell: {},
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  errorCard: { padding: 16 },
  errorText: { color: colors.red[600], textAlign: 'center' },
});
