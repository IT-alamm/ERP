import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AttendanceScreen from '../screens/admin/AttendanceScreen';
import LabourDirectoryScreen from '../screens/admin/LabourDirectoryScreen';
import ProjectsScreen from '../screens/admin/ProjectsScreen';
import LeavesScreen from '../screens/admin/LeavesScreen';
import PayrollScreen from '../screens/admin/PayrollScreen';
import DocumentsScreen from '../screens/admin/DocumentsScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Directory" component={LabourDirectoryScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Leaves" component={LeavesScreen} />
      <Tab.Screen name="Payroll" component={PayrollScreen} />
      <Tab.Screen name="Docs" component={DocumentsScreen} />
    </Tab.Navigator>
  );
}
