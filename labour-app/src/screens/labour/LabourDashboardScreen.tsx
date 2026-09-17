import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, CardHeader, Stat, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Profile {
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  department: string;
  dailyWage: number;
  joiningDate: string;
  status: string;
}

interface Expense {
  id: number;
  expenseDate: string;
  amount: number;
  remarks: string;
}

interface ExpenseTotal {
  labourId: number;
  total: number;
}

export default function LabourDashboardScreen() {
  const navigation = useNavigation<any>();
  const { username } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [presentDays, setPresentDays] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState<ExpenseTotal | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const now = new Date();
      const [profileRes, attendanceRes, totalRes, expensesRes] = await Promise.all([
        api.get('/labour/profile'),
        api.get('/labour/attendance/month', { params: { year: now.getFullYear(), month: now.getMonth() + 1 } }),
        api.get('/labour/expenses/total'),
        api.get('/labour/expenses'),
      ]);
      setProfile(unwrap<Profile>(profileRes));
      const attendance = unwrap<any[]>(attendanceRes);
      setPresentDays(attendance.filter((a: any) => a.status === 'PRESENT').length);
      setExpenseTotal(unwrap<ExpenseTotal>(totalRes));
      setExpenses(unwrap<Expense[]>(expensesRes));
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  }, []);

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

  const totalWages = profile ? presentDays * profile.dailyWage : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Dashboard" currentRoute="Dashboard" onNavigate={(route) => navigation.navigate(route)} />
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
        ) : profile ? (
          <>
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.greeting}>Hello, {profile.firstName} {profile.lastName}</Text>
                <View style={s.codeRow}>
                  <Text style={s.code}>{profile.employeeCode}</Text>
                  <Badge value={profile.status} />
                </View>
              </View>
            </View>

          <View style={s.grid}>
            <Stat label="Total Wages" value={`₹${totalWages.toLocaleString()}`} hint={`${presentDays} days present`} />
            <Stat label="Expenses" value={`₹${(expenseTotal?.total ?? 0).toLocaleString()}`} />
            <Stat label="Attendance Logs" value={String(presentDays)} />
            <Stat label="Leave Requests" value="-" />
          </View>

          <Card style={s.profileCard}>
            <CardHeader title="Profile" />
            <View style={s.profileBody}>
              <View style={s.profileRow}>
                <Text style={s.profileLabel}>Designation</Text>
                <Text style={s.profileValue}>{profile.designation}</Text>
              </View>
              <View style={s.profileRow}>
                <Text style={s.profileLabel}>Department</Text>
                <Text style={s.profileValue}>{profile.department}</Text>
              </View>
              <View style={s.profileRow}>
                <Text style={s.profileLabel}>Daily Wage</Text>
                <Text style={s.profileValue}>₹{profile.dailyWage}</Text>
              </View>
              <View style={s.profileRow}>
                <Text style={s.profileLabel}>Phone</Text>
                <Text style={s.profileValue}>{profile.phone}</Text>
              </View>
              <View style={s.profileRow}>
                <Text style={s.profileLabel}>Joined</Text>
                <Text style={s.profileValue}>{profile.joiningDate}</Text>
              </View>
            </View>
          </Card>

          {expenses.length > 0 && (
            <Card style={s.expensesCard}>
              <CardHeader title="My Expenses" sub={`${expenses.length} entries`} />
              <View style={s.tableHeader}>
                <Text style={[s.tableHeadText, { flex: 1.5 }]}>Date</Text>
                <Text style={[s.tableHeadText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                <Text style={[s.tableHeadText, { flex: 2 }]}>Remarks</Text>
              </View>
              {expenses.map((exp) => (
                <View key={exp.id} style={s.tableRow}>
                  <Text style={[s.tableCell, { flex: 1.5 }]}>{exp.expenseDate}</Text>
                  <Text style={[s.tableCell, { flex: 1, textAlign: 'right' }]}>₹{exp.amount}</Text>
                  <Text style={[s.tableCell, { flex: 2 }]} numberOfLines={1}>{exp.remarks}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: colors.slate[500], fontWeight: '600' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  code: { fontSize: 22, fontWeight: '800', color: colors.navy950 },
  grid: { gap: 10, marginBottom: 16 },
  profileCard: { marginBottom: 16 },
  profileBody: { padding: 16 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  profileLabel: { fontSize: 13, color: colors.slate[500], fontWeight: '600' },
  profileValue: { fontSize: 13, color: colors.slate[900], fontWeight: '700' },
  expensesCard: { marginBottom: 16 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  tableHeadText: { fontSize: 10, fontWeight: '700', color: colors.slate[500], textTransform: 'uppercase', letterSpacing: 0.6 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.slate[50] },
  tableCell: { fontSize: 13, color: colors.slate[700] },
  errorCard: { padding: 16 },
  errorText: { color: colors.red[600], textAlign: 'center' },
});
