import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, CardHeader, Badge, Btn, Field, Input, ErrorText, AppModal } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Project {
  id: number;
  projectCode: string;
  name: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

const EMPTY_PROJECT = {
  projectCode: '', name: '', clientName: '', location: '', startDate: '', endDate: '',
};

export default function ProjectsScreen() {
  const navigation = useNavigation<any>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignLabourId, setAssignLabourId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/admin/projects');
      setProjects(unwrap<Project[]>(res));
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchProjects();
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [fetchProjects]);

  const updateField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleCreate = useCallback(async () => {
    setFormError(null);
    if (!form.projectCode || !form.name) {
      setFormError('Project code and name are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/projects', {
        projectCode: form.projectCode,
        name: form.name,
        clientName: form.clientName,
        location: form.location,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      });
      setShowAdd(false);
      setForm(EMPTY_PROJECT);
      Alert.alert('Success', 'Project created');
      await fetchProjects();
    } catch (e) {
      setFormError(extractError(e));
    }
    setSubmitting(false);
  }, [form, fetchProjects]);

  const handleAssign = useCallback(async () => {
    if (!assignProjectId || !assignLabourId) {
      Alert.alert('Required', 'Enter both Project ID and Labour ID');
      return;
    }
    setAssigning(true);
    try {
      await api.post(`/admin/projects/${assignProjectId}/assign/${assignLabourId}`);
      Alert.alert('Success', 'Worker assigned');
      setAssignProjectId('');
      setAssignLabourId('');
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
    setAssigning(false);
  }, [assignProjectId, assignLabourId]);

  return (
    <View style={s.root}>
      <ScreenHeader title="Projects" currentRoute="Projects" onNavigate={(route) => navigation.navigate(route)} />
      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
        ListHeaderComponent={
          <Card style={s.assignCard}>
            <CardHeader title="Assign Worker" sub="Map a labour to a project" />
            <View style={s.assignRow}>
              <TextInput
                style={s.assignInput}
                placeholder="Project ID"
                placeholderTextColor={colors.slate[400]}
                value={assignProjectId}
                onChangeText={setAssignProjectId}
                keyboardType="numeric"
              />
              <TextInput
                style={s.assignInput}
                placeholder="Labour ID"
                placeholderTextColor={colors.slate[400]}
                value={assignLabourId}
                onChangeText={setAssignLabourId}
                keyboardType="numeric"
              />
              <Btn onPress={handleAssign} disabled={assigning} style={s.assignBtn}>
                {assigning ? '...' : 'Assign'}
              </Btn>
            </View>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={s.card}>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardCode}>{item.projectCode}</Text>
                <Text style={s.cardName}>{item.name}</Text>
                <Text style={s.cardDetail}>Client: {item.clientName}</Text>
                <Text style={s.cardDetail}>Location: {item.location}</Text>
                <Text style={s.cardDetail}>Start: {item.startDate ?? '-'} | End: {item.endDate ?? '-'}</Text>
              </View>
              <Badge value={item.status} />
            </View>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={s.empty}>No projects found</Text> : null}
      />

      {loading && <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />}

      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {showAdd && (
        <AppModal title="New Project" onClose={() => { setShowAdd(false); setForm(EMPTY_PROJECT); setFormError(null); }}>
          <ErrorText message={formError} />
          <Field label="Project Code"><Input value={form.projectCode} onChangeText={(v) => updateField('projectCode', v)} /></Field>
          <Field label="Name"><Input value={form.name} onChangeText={(v) => updateField('name', v)} /></Field>
          <Field label="Client Name"><Input value={form.clientName} onChangeText={(v) => updateField('clientName', v)} /></Field>
          <Field label="Location"><Input value={form.location} onChangeText={(v) => updateField('location', v)} /></Field>
          <Field label="Start Date (YYYY-MM-DD)"><Input value={form.startDate} onChangeText={(v) => updateField('startDate', v)} /></Field>
          <Field label="End Date (YYYY-MM-DD)"><Input value={form.endDate} onChangeText={(v) => updateField('endDate', v)} /></Field>
          <Btn onPress={handleCreate} disabled={submitting} style={s.submitBtn}>{submitting ? 'Creating...' : 'Create Project'}</Btn>
        </AppModal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 10 },
  assignCard: { padding: 14 },
  assignRow: { flexDirection: 'row', gap: 8, padding: 14 },
  assignInput: { flex: 1, borderWidth: 1, borderColor: colors.slate[300], borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: colors.slate[900], backgroundColor: '#fff' },
  assignBtn: { width: 70 },
  card: { padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardCode: { fontSize: 11, fontWeight: '700', color: colors.brand600, textTransform: 'uppercase' },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.slate[900], marginTop: 2 },
  cardDetail: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  empty: { textAlign: 'center', color: colors.slate[500], marginTop: 30 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brand600, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabText: { fontSize: 26, color: '#fff', fontWeight: '700', marginTop: -2 },
  submitBtn: { marginTop: 8 },
});
