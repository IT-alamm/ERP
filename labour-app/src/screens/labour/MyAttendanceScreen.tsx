import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Profile {
  firstName: string;
  lastName: string | null;
  employeeCode: string;
  joiningDate: string | null;
}

interface AttendanceRecord {
  labourId: number;
  attendanceDate: string;
  status: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad2 = (n: number) => String(n).padStart(2, '0');

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

type DayStatus = 'P' | 'A' | 'NONE';

export default function MyAttendanceScreen() {
  const navigation = useNavigation<any>();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [profile, setProfile] = useState<Profile | null>(null);
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
      setProfile(unwrap<Profile>(profileRes));
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
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  const monthKey = `${year}-${pad2(month)}`;

  const recordMap: Record<string, string> = {};
  records.forEach(r => { recordMap[r.attendanceDate] = r.status; });

  // Web (AttendanceOps labour view) jaisa calculation:
  // joining se pehle ke din ginati me nahi, missing past din = Absent, upcoming din = Absent.
  const joinDay =
    profile?.joiningDate && profile.joiningDate.slice(0, 7) === monthKey
      ? parseInt(profile.joiningDate.slice(8, 10), 10)
      : 1;

  const dayStatus = (day: number): DayStatus => {
    if (day < joinDay) return 'NONE';
    const date = `${monthKey}-${pad2(day)}`;
    if (date > todayISO) return 'NONE';
    return recordMap[date] === 'PRESENT' ? 'P' : 'A';
  };

  let presentCount = 0;
  let absentCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const st = dayStatus(d);
    if (st === 'P') presentCount++;
    else if (st === 'A') absentCount++;
  }
  // Future ke din ginati me nahi: aaj join + aaj present = 100%,
  // 2 beete din (1 present + 1 absent) = 50%.
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1);
  const lastCountedDay = isFutureMonth ? 0 : isCurrentMonth ? today.getDate() : daysInMonth;
  const elapsedDays = Math.max(0, lastCountedDay - joinDay + 1);
  const attendancePct = elapsedDays > 0 ? (presentCount / elapsedDays) * 100 : 0;
  const satisfied = attendancePct >= 75;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getStatus = (day: number): { color: string; label: string; dimmed: boolean } => {
    const st = dayStatus(day);
    if (st === 'P') return { color: colors.emerald[500], label: 'P', dimmed: false };
    if (st === 'A') return { color: colors.red[500], label: 'A', dimmed: false };
    return { color: colors.slate[300], label: '—', dimmed: true };
  };

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
            <View style={[s.statTile, { backgroundColor: colors.emerald[50] }]}>
              <Text style={[s.statValue, { color: colors.emerald[600] }]}>{presentCount}</Text>
              <Text style={s.statLabel}>Present</Text>
            </View>
            <View style={[s.statTile, { backgroundColor: colors.red[50] }]}>
              <Text style={[s.statValue, { color: colors.red[600] }]}>{absentCount}</Text>
              <Text style={s.statLabel}>Absent</Text>
            </View>
            <View style={[s.statTile, { backgroundColor: colors.brand600 + '15' }]}>
              <Text style={[s.statValue, { color: colors.brand600 }]}>{attendancePct.toFixed(1)}%</Text>
              <Text style={s.statLabel}>Attendance</Text>
            </View>
            <View style={[s.statTile, { backgroundColor: satisfied ? colors.emerald[50] : colors.red[50] }]}>
              <Text style={[s.statCriteria, { color: satisfied ? colors.emerald[600] : colors.red[600] }]}>
                {satisfied ? 'Satisfied' : 'Not Satisfied'}
              </Text>
              <Text style={s.statLabel}>Criteria (75%)</Text>
            </View>
          </View>

          <Card style={s.registerCard}>
            <Text style={s.registerTitle}>My attendance register</Text>
            {profile && (
              <View style={s.identityRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.identityLabel}>Labour Name</Text>
                  <Text style={s.identityValue}>{profile.firstName} {profile.lastName ?? ''}</Text>
                </View>
                <View>
                  <Text style={s.identityLabel}>Code</Text>
                  <Text style={s.identityValue}>{profile.employeeCode}</Text>
                </View>
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator style={s.stripScroll}>
              <View>
                <View style={s.stripHeaderRow}>
                  {dayNumbers.map((d) => (
                    <Text key={`h-${d}`} style={s.stripHeadCell}>{pad2(d)}</Text>
                  ))}
                </View>
                <View style={s.stripDotRow}>
                  {dayNumbers.map((d) => {
                    const st = dayStatus(d);
                    return (
                      <View key={`d-${d}`} style={s.stripCell}>
                        {st === 'NONE' ? (
                          <Text style={s.stripNone}>–</Text>
                        ) : (
                          <View style={[s.stripDot, { backgroundColor: st === 'P' ? colors.emerald[500] : colors.red[500] }]}>
                            <Text style={s.stripDotText}>{st}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: colors.emerald[500] }]} />
              <Text style={s.legendText}>Present</Text>
              <View style={[s.legendDot, { backgroundColor: colors.red[500] }]} />
              <Text style={s.legendText}>Absent</Text>
            </View>
          </Card>

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
  statTile: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '800' },
  statCriteria: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  statLabel: { fontSize: 10, color: colors.slate[500], marginTop: 2, textAlign: 'center' },
  registerCard: { marginBottom: 16, padding: 16 },
  registerTitle: { fontSize: 11, fontWeight: '700', color: colors.slate[900], textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  identityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  identityLabel: { fontSize: 10, fontWeight: '700', color: colors.slate[500], textTransform: 'uppercase', letterSpacing: 0.6 },
  identityValue: { fontSize: 14, fontWeight: '700', color: colors.slate[900], marginTop: 2 },
  stripScroll: { marginHorizontal: -4 },
  stripHeaderRow: { flexDirection: 'row' },
  stripHeadCell: { width: 34, textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.slate[500], paddingVertical: 4 },
  stripDotRow: { flexDirection: 'row', paddingVertical: 4 },
  stripCell: { width: 34, alignItems: 'center', justifyContent: 'center', minHeight: 30 },
  stripDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stripDotText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  stripNone: { fontSize: 14, color: colors.slate[300] },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.slate[600], marginRight: 10 },
  calendarCard: { marginBottom: 16, padding: 12 },
  dayLabelsRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.slate[500], textTransform: 'uppercase' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  dayDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayDotText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  dayNum: { fontSize: 9, color: colors.slate[600], marginTop: 2 },
  errorCard: { padding: 16 },
  errorText: { color: colors.red[600], textAlign: 'center' },
});
