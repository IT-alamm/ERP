import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

export default function DocumentsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Documents" currentRoute="Docs" onNavigate={(route) => navigation.navigate(route)} />
      <ScrollView style={s.root} contentContainerStyle={s.container}>
        <Text style={s.title}>Document Management</Text>
        <View style={s.card}>
          <Text style={s.icon}>📄</Text>
          <Text style={s.heading}>Coming Soon</Text>
          <Text style={s.sub}>Document upload and management will be available here.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy950, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: colors.slate[200] },
  icon: { fontSize: 48, marginBottom: 12 },
  heading: { fontSize: 20, fontWeight: '700', color: colors.slate[800] },
  sub: { fontSize: 14, color: colors.slate[500], marginTop: 6, textAlign: 'center' },
});
