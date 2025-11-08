import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHazardStore } from '../store/useHazardStore';
import { fetchNearbyHazards } from '../api/hazards';
import { requestLocationPermission } from '../utils/permissions';
import { calculateDistance } from '../utils/formatters';
import HazardMarker from '../components/HazardMarker';

const HomeScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { hazards, setHazards, setIsLoading, isLoading } = useHazardStore();

  useEffect(() => {
    initializeLocation();
    const interval = setInterval(refreshHazards, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeLocation = async () => {
    const { granted } = await requestLocationPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Location permission is required to use this feature.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
      
      const initialRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(initialRegion);
      
      // Fetch hazards for initial location
      await fetchHazards(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const fetchHazards = async (latitude: number, longitude: number) => {
    setIsLoading(true);
    try {
      const fetchedHazards = await fetchNearbyHazards({
        latitude,
        longitude,
        radius: 5,
      });

      // Calculate distance for each hazard
      const hazardsWithDistance = fetchedHazards.map((hazard) => ({
        ...hazard,
        distance: calculateDistance(
          latitude,
          longitude,
          hazard.latitude,
          hazard.longitude
        ),
      }));

      setHazards(hazardsWithDistance);
    } catch (error) {
      console.error('Failed to fetch hazards:', error);
      Alert.alert('Error', 'Failed to load hazards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHazards = async () => {
    if (!userLocation) return;
    
    setIsRefreshing(true);
    await fetchHazards(userLocation.coords.latitude, userLocation.coords.longitude);
    setIsRefreshing(false);
  };

  const centerOnUser = async () => {
    if (!userLocation) return;

    mapRef.current?.animateToRegion({
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const handleHazardPress = (hazard: any) => {
    Alert.alert(
      hazard.type.toUpperCase(),
      `Severity: ${hazard.severity}\n${hazard.description || 'No description'}\nDistance: ${(hazard.distance / 1000).toFixed(2)}km`,
      [{ text: 'OK' }]
    );
  };

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
      >
        {hazards.map((hazard) => (
          <HazardMarker
            key={hazard.id}
            hazard={hazard}
            onPress={handleHazardPress}
          />
        ))}
      </MapView>

      {/* Refresh Button */}
      <TouchableOpacity
        style={[styles.fab, styles.refreshButton]}
        onPress={refreshHazards}
        disabled={isRefreshing}
      >
        <MaterialCommunityIcons
          name="refresh"
          size={24}
          color="#fff"
          style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : {}}
        />
      </TouchableOpacity>

      {/* Center on User Button */}
      <TouchableOpacity
        style={[styles.fab, styles.centerButton]}
        onPress={centerOnUser}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a90e2" />
        </View>
      )}
    </View>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  refreshButton: {
    top: 60,
    right: 16,
  },
  centerButton: {
    top: 130,
    right: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default HomeScreen;
