import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

interface MenuItem {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

interface ScreenHeaderProps {
  title: string;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const adminMenu: MenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
  { label: 'Attendance', icon: 'event', route: 'Attendance' },
  { label: 'Directory', icon: 'people', route: 'Directory' },
  { label: 'Projects', icon: 'work', route: 'Projects' },
  { label: 'Leaves', icon: 'description', route: 'Leaves' },
  { label: 'Payroll', icon: 'payment', route: 'Payroll' },
  { label: 'Documents', icon: 'folder', route: 'Docs' },
];

const labourMenu: MenuItem[] = [
  { label: 'Dashboard', icon: 'home', route: 'Dashboard' },
  { label: 'Attendance', icon: 'event', route: 'Attendance' },
  { label: 'Projects', icon: 'work', route: 'Projects' },
  { label: 'Leaves', icon: 'description', route: 'Leaves' },
  { label: 'Payroll', icon: 'payment', route: 'Payroll' },
  { label: 'Documents', icon: 'folder', route: 'Docs' },
];

export default function ScreenHeader({ title, currentRoute, onNavigate }: ScreenHeaderProps) {
  const { username, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const menu = isAdmin ? adminMenu : labourMenu;
  const initials = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.brand}>Labour</Text>
          <Text style={s.brandAccent}>Ops</Text>
        </View>
        <Text style={s.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={s.dropdown} onPress={() => {}}>
            <View style={s.profileSection}>
              <View style={s.avatarLarge}>
                <Text style={s.avatarLargeText}>{initials}</Text>
              </View>
              <Text style={s.profileName}>{username}</Text>
              <Text style={s.profileRole}>{isAdmin ? 'Administrator' : 'Labour'}</Text>
            </View>

            <View style={s.divider} />

            {menu.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={[s.menuItem, currentRoute === item.route && s.menuItemActive]}
                onPress={() => {
                  setMenuOpen(false);
                  onNavigate(item.route);
                }}
              >
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={currentRoute === item.route ? colors.brand600 : colors.slate[600]}
                />
                <Text style={[s.menuLabel, currentRoute === item.route && s.menuLabelActive]}>
                  {item.label}
                </Text>
                {currentRoute === item.route && (
                  <View style={s.activeDot} />
                )}
              </TouchableOpacity>
            ))}

            <View style={s.divider} />

            <TouchableOpacity style={s.logoutItem} onPress={logout}>
              <MaterialIcons name="logout" size={20} color={colors.red[500]} />
              <Text style={s.logoutLabel}>Logout</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy950,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  brandAccent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38bdf8',
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[300],
    textAlign: 'center',
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 12,
  },
  dropdown: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate[900],
    marginTop: 8,
  },
  profileRole: {
    fontSize: 12,
    color: colors.slate[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate[100],
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: colors.brand600 + '08',
  },
  menuLabel: {
    fontSize: 14,
    color: colors.slate[600],
    fontWeight: '500',
    flex: 1,
  },
  menuLabelActive: {
    color: colors.brand600,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand600,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  logoutLabel: {
    fontSize: 14,
    color: colors.red[500],
    fontWeight: '700',
  },
});
