import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, Badge } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Project {
  id: number;
  projectCode: string;
  name: string;
  description: string | null;
  clientName: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

export default function MyProjectsScreen() {
  const navigation = useNavigation<any>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/labour/projects');
      setProjects(unwrap<Project[]>(res));
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchProjects();
    setLoading(false);
  }, [fetchProjects]);

  React.useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [fetchProjects]);

  return (
    <View style={s.root}>
      <ScreenHeader title="Projects" currentRoute="Projects" onNavigate={(route) => navigation.navigate(route)} />
      {loading ? (
        <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />
      ) : error ? (
        <Card style={s.errorCard}>
          <Text style={s.errorText}>{error}</Text>
        </Card>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
          ListHeaderComponent={<Text style={s.subtitle}>My Sites — projects assigned to me</Text>}
          renderItem={({ item }) => (
            <Card style={s.card}>
              <View style={s.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardCode}>{item.projectCode}</Text>
                  <Text style={s.cardName}>{item.name}</Text>
                  {!!item.description && <Text style={s.cardDetail}>{item.description}</Text>}
                  <Text style={s.cardDetail}>Client: {item.clientName ?? '-'}</Text>
                  <Text style={s.cardDetail}>Location: {item.location ?? '-'}</Text>
                  <Text style={s.cardDetail}>Start: {item.startDate ?? '-'} | End: {item.endDate ?? '-'}</Text>
                </View>
                <Badge value={item.status} />
              </View>
            </Card>
          )}
          ListEmptyComponent={<Text style={s.empty}>No projects assigned yet</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 10 },
  subtitle: { fontSize: 12, color: colors.slate[500], marginBottom: 4 },
  card: { padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardCode: { fontSize: 11, fontWeight: '700', color: colors.brand600 },
  cardName: { fontSize: 15, fontWeight: '800', color: colors.slate[900], marginVertical: 2 },
  cardDetail: { fontSize: 12, color: colors.slate[600], marginTop: 1 },
  empty: { textAlign: 'center', color: colors.slate[500], marginTop: 30 },
  errorCard: { padding: 16, margin: 16 },
  errorText: { color: colors.red[600], textAlign: 'center' },
});
