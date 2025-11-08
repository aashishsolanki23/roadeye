import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import DetectScreen from './src/screens/DetectScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Store
import { useUserStore } from './src/store/useUserStore';
import { useHazardStore } from './src/store/useHazardStore';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Tab = createBottomTabNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { loadUserFromStorage } = useUserStore();
  const { loadCachedHazards } = useHazardStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load persisted data
      await Promise.all([
        loadUserFromStorage(),
        loadCachedHazards(),
      ]);

      // Setup notification listeners
      setupNotifications();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsReady(true);
    }
  };

  const setupNotifications = () => {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (user tapped on notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      // You can navigate to specific screen based on notification data
    });
  };

  if (!isReady) {
    return null; // Or a splash screen component
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;

              switch (route.name) {
                case 'Home':
                  iconName = 'map';
                  break;
                case 'Detect':
                  iconName = 'camera';
                  break;
                case 'Alerts':
                  iconName = 'bell';
                  break;
                case 'Profile':
                  iconName = 'account';
                  break;
                default:
                  iconName = 'circle';
              }

              return (
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={size}
                  color={color}
                />
              );
            },
            tabBarActiveTintColor: '#4a90e2',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarStyle: {
              backgroundColor: '#1f2937',
              borderTopColor: '#374151',
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#1f2937',
              borderBottomColor: '#374151',
              borderBottomWidth: 1,
            },
            headerTintColor: '#f9fafb',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 20,
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Map',
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Detect"
            component={DetectScreen}
            options={{
              title: 'Detect',
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{
              title: 'Alerts',
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profile',
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
