import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, CardHeader, Badge, Btn, Field, Input, ErrorText, AppModal } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Labour {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  department: string;
  dailyWage: number;
  status: string;
  joiningDate: string | null;
}

const EMPTY_FORM = {
  username: '', email: '', password: '', firstName: '', lastName: '',
  phone: '', designation: '', department: '', dailyWage: '',
};

const EMPTY_EDIT = {
  firstName: '', lastName: '', phone: '', designation: '', department: '', dailyWage: '', joiningDate: '',
};

export default function LabourDirectoryScreen() {
  const navigation = useNavigation<any>();
  const [labours, setLabours] = useState<Labour[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLabours = useCallback(async (p = page, s = search) => {
    try {
      const res = await api.get(`/admin/labours?search=${encodeURIComponent(s)}&status=ACTIVE&page=${p}&size=10`);
      const body = unwrap<{ content: Labour[]; totalPages: number }>(res);
      setLabours(body.content);
      setTotalPages(body.totalPages);
    } catch (e) {
      Alert.alert('Error', extractError(e));
    }
  }, [page, search]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchLabours(0, '');
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLabours(page, search);
    setRefreshing(false);
  }, [page, search]);

  const doSearch = useCallback(() => {
    setPage(0);
    fetchLabours(0, search);
  }, [search, fetchLabours]);

  const goPage = useCallback((delta: number) => {
    const next = page + delta;
    if (next < 0 || next >= totalPages) return;
    setPage(next);
    fetchLabours(next, search);
  }, [page, totalPages, search, fetchLabours]);

  const updateField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const updateEditField = (field: string, value: string) => setEditForm((f) => ({ ...f, [field]: value }));

  const handleCreate = useCallback(async () => {
    setFormError(null);
    if (!form.username || !form.password || !form.firstName || !form.lastName) {
      setFormError('Username, password, first name, and last name are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/labours', {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        designation: form.designation,
        department: form.department,
        dailyWage: form.dailyWage ? Number(form.dailyWage) : 0,
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      Alert.alert('Success', 'Labour created');
      await fetchLabours(0, search);
    } catch (e) {
      setFormError(extractError(e));
    }
    setSubmitting(false);
  }, [form, search, fetchLabours]);

  const openEdit = useCallback((l: Labour) => {
    setEditId(l.id);
    setEditForm({
      firstName: l.firstName,
      lastName: l.lastName,
      phone: l.phone,
      designation: l.designation,
      department: l.department,
      dailyWage: String(l.dailyWage),
      joiningDate: l.joiningDate ?? '',
    });
    setShowEdit(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (editId === null) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await api.put(`/admin/labours/${editId}`, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        designation: editForm.designation,
        department: editForm.department,
        dailyWage: editForm.dailyWage ? Number(editForm.dailyWage) : 0,
        joiningDate: editForm.joiningDate || undefined,
      });
      setShowEdit(false);
      setEditId(null);
      Alert.alert('Success', 'Labour updated');
      await fetchLabours(page, search);
    } catch (e) {
      setFormError(extractError(e));
    }
    setSubmitting(false);
  }, [editId, editForm, page, search, fetchLabours]);

  const handleDelete = useCallback((l: Labour) => {
    Alert.alert('Delete Labour', `Are you sure you want to delete ${l.firstName} ${l.lastName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/labours/${l.id}`);
            Alert.alert('Deleted', 'Labour removed');
            await fetchLabours(page, search);
          } catch (e) {
            Alert.alert('Error', extractError(e));
          }
        },
      },
    ]);
  }, [page, search, fetchLabours]);

  return (
    <View style={s.root}>
      <ScreenHeader title="Directory" currentRoute="Directory" onNavigate={(route) => navigation.navigate(route)} />
      <View style={s.topBar}>
        <TextInput
          style={s.search}
          placeholder="Search by name or designation..."
          placeholderTextColor={colors.slate[400]}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <Btn onPress={() => setShowAdd(true)} style={s.addBtn}>+</Btn>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />
      ) : (
        <>
          <FlatList
            data={labours}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
            renderItem={({ item }) => (
              <TouchableOpacity onLongPress={() => openEdit(item)} activeOpacity={0.7}>
                <Card style={s.card}>
                  <View style={s.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardName}>{item.firstName} {item.lastName}</Text>
                      <Text style={s.cardDetail}>{item.phone}</Text>
                      <Text style={s.cardDetail}>{item.designation} &middot; {item.department}</Text>
                      <Text style={s.cardWage}>₹{item.dailyWage}/day</Text>
                    </View>
                    <View style={s.cardRight}>
                      <Badge value={item.status} />
                    </View>
                  </View>
                  <View style={s.cardActions}>
                    <Btn variant="ghost" onPress={() => openEdit(item)} style={s.cardActionBtn}>Edit</Btn>
                    <Btn variant="danger" onPress={() => handleDelete(item)} style={s.cardActionBtn}>Delete</Btn>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.empty}>No labours found</Text>}
          />
          <View style={s.pagination}>
            <Btn variant="ghost" onPress={() => goPage(-1)} disabled={page === 0} style={s.pageBtn}>Prev</Btn>
            <Text style={s.pageInfo}>{page + 1} / {totalPages}</Text>
            <Btn variant="ghost" onPress={() => goPage(1)} disabled={page >= totalPages - 1} style={s.pageBtn}>Next</Btn>
          </View>
        </>
      )}

      {showAdd && (
        <AppModal title="Add Labour" onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(null); }}>
          <ErrorText message={formError} />
          <Field label="Username"><Input value={form.username} onChangeText={(v) => updateField('username', v)} /></Field>
          <Field label="Email"><Input value={form.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" /></Field>
          <Field label="Password"><Input value={form.password} onChangeText={(v) => updateField('password', v)} secureTextEntry /></Field>
          <Field label="First Name"><Input value={form.firstName} onChangeText={(v) => updateField('firstName', v)} /></Field>
          <Field label="Last Name"><Input value={form.lastName} onChangeText={(v) => updateField('lastName', v)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" /></Field>
          <Field label="Designation"><Input value={form.designation} onChangeText={(v) => updateField('designation', v)} /></Field>
          <Field label="Department"><Input value={form.department} onChangeText={(v) => updateField('department', v)} /></Field>
          <Field label="Daily Wage"><Input value={form.dailyWage} onChangeText={(v) => updateField('dailyWage', v)} keyboardType="numeric" /></Field>
          <Btn onPress={handleCreate} disabled={submitting} style={s.submitBtn}>{submitting ? 'Creating...' : 'Create Labour'}</Btn>
        </AppModal>
      )}

      {showEdit && (
        <AppModal title="Edit Labour" onClose={() => { setShowEdit(false); setEditId(null); setFormError(null); }}>
          <ErrorText message={formError} />
          <Field label="First Name"><Input value={editForm.firstName} onChangeText={(v) => updateEditField('firstName', v)} /></Field>
          <Field label="Last Name"><Input value={editForm.lastName} onChangeText={(v) => updateEditField('lastName', v)} /></Field>
          <Field label="Phone"><Input value={editForm.phone} onChangeText={(v) => updateEditField('phone', v)} keyboardType="phone-pad" /></Field>
          <Field label="Designation"><Input value={editForm.designation} onChangeText={(v) => updateEditField('designation', v)} /></Field>
          <Field label="Department"><Input value={editForm.department} onChangeText={(v) => updateEditField('department', v)} /></Field>
          <Field label="Daily Wage"><Input value={editForm.dailyWage} onChangeText={(v) => updateEditField('dailyWage', v)} keyboardType="numeric" /></Field>
          <Field label="Joining Date (YYYY-MM-DD)"><Input value={editForm.joiningDate} onChangeText={(v) => updateEditField('joiningDate', v)} placeholder="2026-09-19" /></Field>
          <Btn onPress={handleUpdate} disabled={submitting} style={s.submitBtn}>{submitting ? 'Updating...' : 'Update Labour'}</Btn>
        </AppModal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 8 },
  search: { flex: 1, borderWidth: 1, borderColor: colors.slate[300], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.slate[900], backgroundColor: '#fff' },
  addBtn: { width: 44, height: 44 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  card: { padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardRight: { marginLeft: 8 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.slate[900] },
  cardDetail: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  cardWage: { fontSize: 13, fontWeight: '700', color: colors.brand600, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.slate[100], paddingTop: 10 },
  cardActionBtn: { flex: 1 },
  empty: { textAlign: 'center', color: colors.slate[500], marginTop: 30 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 12 },
  pageBtn: { minWidth: 60 },
  pageInfo: { fontSize: 13, color: colors.slate[600], fontWeight: '600' },
  submitBtn: { marginTop: 8 },
});
