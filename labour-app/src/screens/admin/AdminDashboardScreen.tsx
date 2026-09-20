import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, unwrap, extractError } from '../../services/api';
import { AppModal, Card, Stat } from '../../components/ui';
import ScreenHeader from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

interface DashboardStats {
  totalLabours: number;
  activeLabours: number;
  totalProjects: number;
  pendingLeaves: number;
  presentToday: number;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresent, setShowPresent] = useState(false);
  const [presentList, setPresentList] = useState<{ id: number; firstName: string; lastName: string | null; employeeCode: string }[]>([]);
  const [presentLoading, setPresentLoading] = useState(false);
  const [presentError, setPresentError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(unwrap<DashboardStats>(res));
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchStats();
    setLoading(false);
  }, [fetchStats]);

  React.useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const openPresentList = useCallback(async () => {
    setShowPresent(true);
    setPresentLoading(true);
    setPresentError(null);
    try {
      const res = await api.get('/admin/attendance/today-present');
      setPresentList(unwrap<{ id: number; firstName: string; lastName: string | null; employeeCode: string }[]>(res));
    } catch (e) {
      setPresentError(extractError(e));
    } finally {
      setPresentLoading(false);
    }
  }, []);

  return (
    <View style={s.root}>
      <ScreenHeader title="Dashboard" currentRoute="Dashboard" onNavigate={(route) => navigation.navigate(route)} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
      >
        <View style={s.titleRow}>
          <Text style={s.greeting}>Good day, Admin</Text>
          <Text style={s.title}>Operational Command Center</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />
        ) : error ? (
          <Card style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
          </Card>
        ) : stats ? (
          <View style={s.grid}>
            <Stat label="Total Workforce" value={String(stats.totalLabours)} />
            <Stat label="Active Today" value={String(stats.activeLabours)} hint="Currently active" />
            <Stat label="Active Sites" value={String(stats.totalProjects)} />
            <Stat label="Pending Leaves" value={String(stats.pendingLeaves)} />
            <TouchableOpacity onPress={openPresentList} activeOpacity={0.7}>
              <Stat label="Present Today — tap to view" value={String(stats.presentToday)} />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {showPresent && (
        <AppModal title={`Present Today (${presentList.length})`} onClose={() => setShowPresent(false)}>
          {presentLoading ? (
            <ActivityIndicator size="large" color={colors.brand600} style={{ marginVertical: 20 }} />
          ) : presentError ? (
            <Text style={s.errorText}>{presentError}</Text>
          ) : presentList.length === 0 ? (
            <Text style={s.emptyText}>Aaj koi present nahi hai</Text>
          ) : (
            <FlatList
              data={presentList}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={s.presentRow}>
                  <View style={s.presentDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.presentName}>{item.firstName} {item.lastName ?? ''}</Text>
                    <Text style={s.presentCode}>{item.employeeCode}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </AppModal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  container: { padding: 16 },
  titleRow: { marginBottom: 20 },
  greeting: { fontSize: 14, color: colors.slate[500], fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy950, marginTop: 2 },
  grid: { gap: 10 },
  errorCard: { padding: 16 },
  errorText: { color: colors.red[600], textAlign: 'center' },
  emptyText: { color: colors.slate[500], textAlign: 'center', paddingVertical: 16 },
  presentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.slate[100] },
  presentDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.emerald[500] },
  presentName: { fontSize: 14, fontWeight: '700', color: colors.slate[900] },
  presentCode: { fontSize: 12, color: colors.slate[500], marginTop: 1 },
});
