import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { Btn, Field, Input, ErrorText } from '../../components/ui';
import { api, extractError } from '../../services/api';
import { useKeyboardScroll } from '../../hooks/useKeyboardScroll';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { scrollRef, handleLayout, scrollToField } = useKeyboardScroll();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    const { username, email, password, firstName, lastName } = form;
    if (!username.trim() || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'ROLE_ADMIN',
      });
      Alert.alert('Success', 'Account created successfully. Please sign in.');
      navigation.goBack();
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={s.cardTitle}>Create Account</Text>
          <Text style={s.cardSub}>Register as an administrator to get started.</Text>

          <View style={s.row}>
            <View style={s.halfField} onLayout={handleLayout('firstName')}>
              <Field label="First Name">
                <Input
                  placeholder="First name"
                  value={form.firstName}
                  onChangeText={set('firstName')}
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => scrollToField('firstName')}
                />
              </Field>
            </View>
            <View style={s.halfField} onLayout={handleLayout('lastName')}>
              <Field label="Last Name">
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChangeText={set('lastName')}
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => scrollToField('lastName')}
                />
              </Field>
            </View>
          </View>

          <View onLayout={handleLayout('username')}>
            <Field label="Username">
              <Input
                placeholder="Choose a username"
                value={form.username}
                onChangeText={set('username')}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => scrollToField('username')}
              />
            </Field>
          </View>

          <View onLayout={handleLayout('email')}>
            <Field label="Email">
              <Input
                placeholder="Enter your email"
                value={form.email}
                onChangeText={set('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => scrollToField('email')}
              />
            </Field>
          </View>

          <View onLayout={handleLayout('password')}>
            <Field label="Password">
              <Input
                placeholder="Create a password"
                value={form.password}
                onChangeText={set('password')}
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
              'Create Account'
            )}
          </Btn>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.loginLink}
          >
            <Text style={s.loginText}>
              Already have an account?{' '}
              <Text style={s.loginBold}>Sign In</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 4,
    paddingVertical: 13,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 13,
    color: colors.slate[500],
  },
  loginBold: {
    color: colors.brand600,
    fontWeight: '700',
  },
});
