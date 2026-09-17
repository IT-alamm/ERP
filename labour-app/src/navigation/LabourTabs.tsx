import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LabourDashboardScreen from '../screens/labour/LabourDashboardScreen';
import MyAttendanceScreen from '../screens/labour/MyAttendanceScreen';
import ProjectsScreen from '../screens/admin/ProjectsScreen';
import MyLeavesScreen from '../screens/labour/MyLeavesScreen';
import MyPayrollScreen from '../screens/labour/MyPayrollScreen';
import MyDocumentsScreen from '../screens/labour/MyDocumentsScreen';

const Tab = createBottomTabNavigator();

export default function LabourTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Dashboard" component={LabourDashboardScreen} />
      <Tab.Screen name="Attendance" component={MyAttendanceScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Leaves" component={MyLeavesScreen} />
      <Tab.Screen name="Payroll" component={MyPayrollScreen} />
      <Tab.Screen name="Docs" component={MyDocumentsScreen} />
    </Tab.Navigator>
  );
}
