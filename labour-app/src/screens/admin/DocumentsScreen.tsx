import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

export default function DocumentsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={s.root}>
      <ScreenHeader title="Documents" currentRoute="Docs" onNavigate={(route) => navigation.navigate(route)} />
      <Text style={s.title}>Document Management</Text>
      <View style={s.placeholder}>
        <Text style={s.icon}>📄</Text>
        <Text style={s.heading}>Coming Soon</Text>
        <Text style={s.sub}>Document upload and management will be available here.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy950, marginBottom: 24 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48, marginBottom: 12 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.slate[700] },
  sub: { fontSize: 13, color: colors.slate[500], marginTop: 4, textAlign: 'center' },
});
