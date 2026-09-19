import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { Btn, Field, Input, ErrorText } from '../../components/ui';
import { extractError } from '../../services/api';
import { useKeyboardScroll } from '../../hooks/useKeyboardScroll';

const ROLES = ['ROLE_ADMIN', 'ROLE_LABOUR'] as const;

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, role } = useAuth();
  const { scrollRef, handleLayout, scrollToField } = useKeyboardScroll();

  const [selectedRole, setSelectedRole] = useState<string>(ROLES[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    navigation.reset({
      index: 0,
      routes: [{ name: role === 'ROLE_ADMIN' ? 'AdminTabs' : 'LabourTabs' }],
    });
  }, [role]);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password, selectedRole);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = selectedRole === 'ROLE_ADMIN' ? 'Administrator' : 'Labour';

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <Text style={s.brand}>LabourOps</Text>
          <Text style={s.subtitle}>Workforce Deployment Cloud</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>
          <Text style={s.cardSub}>Welcome back. Choose your role and enter your credentials.</Text>

          <View style={s.roleRow}>
            {ROLES.map((r) => {
              const active = selectedRole === r;
              const label = r === 'ROLE_ADMIN' ? 'Administrator' : 'Labour';
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setSelectedRole(r)}
                  style={[s.roleBtn, active && s.roleBtnActive]}
                >
                  <Text style={[s.roleBtnText, active && s.roleBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View onLayout={handleLayout('username')}>
            <Field label="Username">
              <Input
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => scrollToField('username')}
              />
            </Field>
          </View>

          <View onLayout={handleLayout('password')}>
            <Field label="Password">
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                onFocus={() => scrollToField('password')}
              />
            </Field>
          </View>

          <ErrorText message={error} />

          <Btn
            variant="primary"
            disabled={loading}
            onPress={handleSubmit}
            style={s.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              `Sign In as ${roleLabel}`
            )}
          </Btn>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={s.registerLink}
          >
            <Text style={s.registerText}>
              Don't have an account?{' '}
              <Text style={s.registerBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: colors.navy950,
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slate[400],
    marginTop: 4,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate[900],
  },
  cardSub: {
    fontSize: 13,
    color: colors.slate[500],
    marginTop: 4,
    marginBottom: 20,
  },
  roleRow: {
    flexDirection: 'row',
    backgroundColor: colors.slate[100],
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleBtnActive: {
    backgroundColor: colors.brand600,
    shadowColor: colors.brand600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[500],
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    marginTop: 4,
    paddingVertical: 13,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 13,
    color: colors.slate[500],
  },
  registerBold: {
    color: colors.brand600,
    fontWeight: '700',
  },
});
