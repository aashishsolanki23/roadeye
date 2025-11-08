import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  canAskAgain?: boolean;
}

/**
 * Request camera permission
 */
export const requestCameraPermission = async (): Promise<PermissionResult> => {
  try {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'RoadEye needs camera access to detect road hazards. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return { granted: false, canAskAgain };
    }
    
    return { granted: true };
  } catch (error) {
    console.error('Failed to request camera permission:', error);
    return { granted: false };
  }
};

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<PermissionResult> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'RoadEye needs your location to show nearby hazards and report new ones. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return { granted: false, canAskAgain };
    }
    
    return { granted: true };
  } catch (error) {
    console.error('Failed to request location permission:', error);
    return { granted: false };
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<PermissionResult> => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4a90e2',
      });
    }

    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Notification Permission',
        'Enable notifications to receive alerts about nearby road hazards.',
        [{ text: 'OK' }]
      );
      return { granted: false, canAskAgain };
    }
    
    return { granted: true };
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return { granted: false };
  }
};

/**
 * Check if camera permission is granted
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check camera permission:', error);
    return false;
  }
};

/**
 * Check if location permission is granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check location permission:', error);
    return false;
  }
};

/**
 * Check if notification permission is granted
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
};

/**
 * Request all required permissions at once
 */
export const requestAllPermissions = async (): Promise<{
  camera: boolean;
  location: boolean;
  notifications: boolean;
}> => {
  const [camera, location, notifications] = await Promise.all([
    requestCameraPermission(),
    requestLocationPermission(),
    requestNotificationPermission(),
  ]);

  return {
    camera: camera.granted,
    location: location.granted,
    notifications: notifications.granted,
  };
};
