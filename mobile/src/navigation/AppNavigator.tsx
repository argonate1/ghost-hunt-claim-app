import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { GhostIcon } from '../components/GhostIcon';
import { ScanIcon } from '../components/ScanIcon';
import { MapIcon } from '../components/MapIcon';
import { ClaimsIcon } from '../components/ClaimsIcon';
import { SettingsIcon } from '../components/SettingsIcon';

// Import screens
import LandingScreen from '../screens/LandingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import MapScreen from '../screens/MapScreen';
import ClaimsScreen from '../screens/ClaimsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
      {icon}
    </Text>
  </View>
);

// Custom tab icon component for the ghost
const GhostTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <GhostIcon 
      size={26} 
      color={focused ? colors.text.primary : colors.text.muted} 
      focused={focused}
    />
  </View>
);

// Custom tab icon component for the scan
const ScanTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <ScanIcon 
      size={26} 
      color={focused ? colors.text.primary : colors.text.muted} 
      focused={focused}
    />
  </View>
);

// Custom tab icon component for the map
const MapTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <MapIcon 
      size={26} 
      color={focused ? colors.text.primary : colors.text.muted} 
      focused={focused}
    />
  </View>
);

// Custom tab icon component for the claims
const ClaimsTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <ClaimsIcon 
      size={26} 
      color={focused ? colors.text.primary : colors.text.muted} 
      focused={focused}
    />
  </View>
);

// Custom tab icon component for the settings
const SettingsTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <SettingsIcon 
      size={26} 
      color={focused ? colors.text.primary : colors.text.muted} 
      focused={focused}
    />
  </View>
);

// Main tab navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 8,
          height: 88,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Feed',
          headerShown: false,
          tabBarIcon: ({ focused }) => <GhostTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => <ScanTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Map',
          headerShown: false,
          tabBarIcon: ({ focused }) => <MapTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsScreen}
        options={{
          title: 'Claims',
          tabBarIcon: ({ focused }) => <ClaimsTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <SettingsTabIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Main app navigator
export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <View style={commonStyles.ghostIconLarge}>
          <Text style={styles.ghostEmoji}>👻</Text>
        </View>
        <Text style={commonStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </>
      ) : (
        <Stack.Screen name="Landing" component={LandingScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  tabIconText: {
    fontSize: 20,
  },
  tabIconTextFocused: {
    color: colors.text.primary,
  },
  ghostEmoji: {
    fontSize: 48,
    color: colors.text.primary,
  },
}); 