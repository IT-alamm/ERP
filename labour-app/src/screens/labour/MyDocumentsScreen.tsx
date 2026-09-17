import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';

export default function MyDocumentsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Documents" currentRoute="Docs" onNavigate={(route) => navigation.navigate(route)} />
      <View style={s.container}>
        <Card style={s.card}>
        <View style={s.body}>
          <Text style={s.icon}>📁</Text>
          <Text style={s.heading}>Coming Soon</Text>
          <Text style={s.message}>Document management will be available here. You will be able to view and upload your documents.</Text>
        </View>
        </Card>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  card: { marginTop: 20 },
  body: { alignItems: 'center', padding: 40 },
  icon: { fontSize: 48, marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.slate[900], marginBottom: 8 },
  message: { fontSize: 14, color: colors.slate[500], textAlign: 'center', lineHeight: 20 },
});
