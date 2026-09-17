import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api, unwrap, extractError } from '../../services/api';
import { Card, CardHeader, Badge, Btn, Field, Input, ErrorText } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

interface Leave {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

const LEAVE_TYPES = ['CASUAL', 'SICK', 'EARNED', 'UNPAID', 'OTHER'];

export default function MyLeavesScreen() {
  const navigation = useNavigation<any>();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get('/labour/leaves', { params: { page: 0, size: 20 } });
      setLeaves(unwrap<{ content: Leave[] }>(res).content);
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchLeaves();
    setLoading(false);
  }, [fetchLeaves]);

  React.useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  }, [fetchLeaves]);

  const resetForm = () => {
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setFormError(null);
    setShowForm(false);
    setPickerOpen(false);
  };

  const submitLeave = async () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      setFormError('All fields are required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/labour/leaves', { leaveType, startDate, endDate, reason });
      resetForm();
      await fetchLeaves();
      Alert.alert('Success', 'Leave request submitted');
    } catch (e) {
      setFormError(extractError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const renderLeave = ({ item }: { item: Leave }) => (
    <Card style={s.leaveCard}>
      <View style={s.leaveHeader}>
        <Text style={s.leaveType}>{item.leaveType.replace('_', ' ')}</Text>
        <Badge value={item.status} />
      </View>
      <Text style={s.leavePeriod}>{item.startDate} — {item.endDate}</Text>
      <Text style={s.leaveReason}>{item.reason}</Text>
    </Card>
  );

  return (
    <View style={s.root}>
      <ScreenHeader title="Leaves" currentRoute="Leaves" onNavigate={(route) => navigation.navigate(route)} />
      <FlatList
        data={leaves}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderLeave}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View>
            <View style={s.header}>
              <Btn variant={showForm ? 'ghost' : 'primary'} onPress={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ Apply'}
              </Btn>
            </View>

            {showForm && (
              <Card style={s.formCard}>
                <CardHeader title="Apply for Leave" />
                <View style={s.formBody}>
                  <ErrorText message={formError} />

                  <Field label="Leave Type">
                    <TouchableOpacity style={s.picker} onPress={() => setPickerOpen(!pickerOpen)}>
                      <Text style={[s.pickerText, !leaveType && { color: colors.slate[400] }]}>
                        {leaveType || 'Select leave type'}
                      </Text>
                      <Text style={s.pickerArrow}>{pickerOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {pickerOpen && (
                      <View style={s.pickerDropdown}>
                        {LEAVE_TYPES.map(type => (
                          <TouchableOpacity
                            key={type}
                            style={[s.pickerOption, leaveType === type && s.pickerOptionActive]}
                            onPress={() => { setLeaveType(type); setPickerOpen(false); }}
                          >
                            <Text style={[s.pickerOptionText, leaveType === type && s.pickerOptionTextActive]}>
                              {type.replace('_', ' ')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Field>

                  <Field label="Start Date">
                    <Input placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
                  </Field>

                  <Field label="End Date">
                    <Input placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
                  </Field>

                  <Field label="Reason">
                    <Input placeholder="Reason for leave" value={reason} onChangeText={setReason} multiline numberOfLines={3} style={{ textAlignVertical: 'top' }} />
                  </Field>

                  <Btn variant="primary" onPress={submitLeave} disabled={submitting} style={s.submitBtn}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Btn>
                </View>
              </Card>
            )}

            {loading ? (
              <ActivityIndicator size="large" color={colors.brand600} style={{ marginTop: 40 }} />
            ) : error ? (
              <Card style={s.errorCard}>
                <Text style={s.errorText}>{error}</Text>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyText}>No leave requests found</Text>
            </Card>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 20 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy950 },
  formCard: { marginBottom: 16 },
  formBody: { padding: 16 },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.slate[300], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  pickerText: { fontSize: 14, color: colors.slate[900] },
  pickerArrow: { fontSize: 10, color: colors.slate[500] },
  pickerDropdown: { borderWidth: 1, borderColor: colors.slate[200], borderRadius: 10, marginTop: 4, backgroundColor: '#fff', overflow: 'hidden' },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.slate[50] },
  pickerOptionActive: { backgroundColor: colors.brand600 + '10' },
  pickerOptionText: { fontSize: 14, color: colors.slate[700] },
  pickerOptionTextActive: { color: colors.brand600, fontWeight: '700' },
  submitBtn: { marginTop: 4 },
  leaveCard: { marginBottom: 10, padding: 16 },
  leaveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  leaveType: { fontSize: 14, fontWeight: '700', color: colors.slate[900] },
  leavePeriod: { fontSize: 12, color: colors.slate[500], marginBottom: 4 },
  leaveReason: { fontSize: 13, color: colors.slate[600] },
  errorCard: { padding: 16 },
  errorText: { color: colors.red[600], textAlign: 'center' },
  emptyCard: { padding: 24 },
  emptyText: { fontSize: 14, color: colors.slate[400], textAlign: 'center' },
});
