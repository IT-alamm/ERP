import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors } from '../theme/colors';

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function CardHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <View style={s.cardHeader}>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        {sub && <Text style={s.cardSub}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {hint && <Text style={s.statHint}>{hint}</Text>}
    </Card>
  );
}

const badgeBg: Record<string, string> = {
  ACTIVE: colors.emerald[500],
  PRESENT: colors.emerald[500],
  APPROVED: colors.emerald[500],
  PAID: colors.emerald[500],
  GENERATED: '#3b82f6',
  PENDING: colors.amber[500],
  DRAFT: colors.slate[400],
  ABSENT: colors.red[500],
  REJECTED: colors.red[500],
  CANCELLED: colors.red[500],
  TERMINATED: colors.red[500],
  INACTIVE: colors.slate[400],
  HALF_DAY: colors.orange[500],
  LEAVE: colors.purple[500],
  ONGOING: '#3b82f6',
  PLANNED: colors.slate[400],
  COMPLETED: colors.emerald[500],
};

export function Badge({ value }: { value: string }) {
  const bg = badgeBg[value] ?? colors.slate[400];
  return (
    <View style={[s.badge, { backgroundColor: bg + '20' }]}>
      <Text style={[s.badgeText, { color: bg }]}>{value.replace('_', ' ')}</Text>
    </View>
  );
}

export function Btn({
  variant = 'primary',
  disabled = false,
  onPress,
  children,
  style,
}: {
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
  style?: any;
}) {
  const bg =
    variant === 'primary'
      ? colors.brand600
      : variant === 'danger'
        ? colors.red[600]
        : 'transparent';
  const textColor = variant === 'ghost' ? colors.slate[700] : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        variant === 'ghost' && s.btnGhost,
        style,
      ]}
    >
      <Text style={[s.btnText, { color: textColor }]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput {...props} style={[s.input, props.style]} placeholderTextColor={colors.slate[400]} />;
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={s.errorBox}>
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

export function AppModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <RNModal transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody}>{children}</ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate[900],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardSub: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  stat: {
    padding: 14,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.slate[900],
    marginTop: 4,
  },
  statHint: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate[600],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate[900],
    backgroundColor: '#fff',
  },
  errorBox: {
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 13,
    color: colors.red[700],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[900],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalClose: {
    fontSize: 18,
    color: colors.slate[500],
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
});
