import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, CardHeader, Badge, Btn } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Leave {
  id: number;
  labourId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export default function LeavesScreen() {
  const navigation = useNavigation<any>();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<number | null>(null);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get('/admin/leaves/pending?page=0&size=20');
      const body = unwrap<{ content: Leave[] }>(res);
      setLeaves(body.content);
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchLeaves();
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  }, [fetchLeaves]);

  const decide = useCallback(async (id: number, decision: 'APPROVED' | 'REJECTED') => {
    setActing(id);
    try {
      await api.patch(`/admin/leaves/${id}?decision=${decision}`);
      Alert.alert('Done', `Leave ${decision.toLowerCase()}`);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
    setActing(null);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Leaves" currentRoute="Leaves" onNavigate={(route) => navigation.navigate(route)} />
    <FlatList
      style={s.root}
      contentContainerStyle={s.list}
      data={leaves}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
      ListHeaderComponent={<Text style={s.title}>Pending Leaves</Text>}
      renderItem={({ item }) => (
        <Card style={s.card}>
          <View style={s.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardType}>{item.leaveType}</Text>
              <Text style={s.cardDate}>{item.startDate} to {item.endDate}</Text>
              <Text style={s.cardReason}>{item.reason}</Text>
              <Text style={s.cardLabour}>Labour ID: {item.labourId}</Text>
            </View>
            <Badge value={item.status} />
          </View>
          <View style={s.cardActions}>
            <Btn
              onPress={() => decide(item.id, 'APPROVED')}
              disabled={acting === item.id}
              style={s.approveBtn}
            >
              {acting === item.id ? '...' : 'Approve'}
            </Btn>
            <Btn
              variant="danger"
              onPress={() => decide(item.id, 'REJECTED')}
              disabled={acting === item.id}
              style={s.rejectBtn}
            >
              Reject
            </Btn>
          </View>
        </Card>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />
        ) : (
          <Text style={s.empty}>No pending leaves</Text>
        )
      }
    />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy950, marginBottom: 4 },
  card: { padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardType: { fontSize: 14, fontWeight: '700', color: colors.slate[900] },
  cardDate: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  cardReason: { fontSize: 12, color: colors.slate[600], marginTop: 4 },
  cardLabour: { fontSize: 11, color: colors.slate[400], marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.slate[100], paddingTop: 10 },
  approveBtn: { flex: 1 },
  rejectBtn: { flex: 1 },
  empty: { textAlign: 'center', color: colors.slate[500], marginTop: 30 },
});
