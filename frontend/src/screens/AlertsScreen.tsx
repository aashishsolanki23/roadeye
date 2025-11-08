import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHazardStore, Hazard } from '../store/useHazardStore';
import { fetchNearbyHazards } from '../api/hazards';
import { calculateDistance, formatDateTime } from '../utils/formatters';
import HazardCard from '../components/HazardCard';

const AlertsScreen: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { nearbyHazards, setNearbyHazards, isLoading, setIsLoading } = useHazardStore();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const hazards = await fetchNearbyHazards({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 10,
      });

      // Calculate distances and sort by nearest
      const hazardsWithDistance = hazards
        .map((hazard) => ({
          ...hazard,
          distance: calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            hazard.latitude,
            hazard.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      setNearbyHazards(hazardsWithDistance);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleHazardPress = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedHazard(null);
  };

  const renderHazardItem = ({ item }: { item: Hazard }) => (
    <HazardCard hazard={item} onPress={handleHazardPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyText}>No hazards nearby</Text>
      <Text style={styles.emptySubtext}>
        You're in a safe area! We'll notify you of any new hazards.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Alerts</Text>
        <Text style={styles.subtitle}>
          {nearbyHazards.length} hazard{nearbyHazards.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={nearbyHazards}
          renderItem={renderHazardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4a90e2"
              colors={['#4a90e2']}
            />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedHazard?.type.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialCommunityIcons name="close" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {selectedHazard && (
              <>
                <View style={styles.modalMap}>
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                      latitude: selectedHazard.latitude,
                      longitude: selectedHazard.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: selectedHazard.latitude,
                        longitude: selectedHazard.longitude,
                      }}
                    />
                  </MapView>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="alert" size={20} color="#9ca3af" />
                    <Text style={styles.detailLabel}>Severity:</Text>
                    <Text style={styles.detailValue}>
                      {selectedHazard.severity.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#9ca3af" />
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailValue}>
                      {selectedHazard.distance
                        ? `${(selectedHazard.distance / 1000).toFixed(2)} km`
                        : 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#9ca3af" />
                    <Text style={styles.detailLabel}>Reported:</Text>
                    <Text style={styles.detailValue}>
                      {formatDateTime(selectedHazard.timestamp)}
                    </Text>
                  </View>

                  {selectedHazard.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionLabel}>Description:</Text>
                      <Text style={styles.descriptionText}>
                        {selectedHazard.description}
                      </Text>
                    </View>
                  )}

                  {selectedHazard.verified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#4ade80" />
                      <Text style={styles.verifiedText}>Verified by community</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f9fafb',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  modalMap: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  modalDetails: {
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#f9fafb',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
  },
});

export default AlertsScreen;
