import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Hazard } from '../store/useHazardStore';
import {
  formatDistance,
  formatRelativeTime,
  getHazardTypeName,
  getHazardSeverityColor,
  getHazardTypeIcon,
  truncateText,
} from '../utils/formatters';

interface HazardCardProps {
  hazard: Hazard;
  onPress?: (hazard: Hazard) => void;
}

const HazardCard: React.FC<HazardCardProps> = ({ hazard, onPress }) => {
  const severityColor = getHazardSeverityColor(hazard.severity);
  const iconName = getHazardTypeIcon(hazard.type);
  const typeName = getHazardTypeName(hazard.type);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(hazard)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={28}
          color={severityColor}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{typeName}</Text>
          <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
            <Text style={styles.severityText}>
              {hazard.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        {hazard.description && (
          <Text style={styles.description}>
            {truncateText(hazard.description, 80)}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#9ca3af" />
            <Text style={styles.infoText}>
              {hazard.distance ? formatDistance(hazard.distance) : 'Unknown'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#9ca3af" />
            <Text style={styles.infoText}>
              {formatRelativeTime(hazard.timestamp)}
            </Text>
          </View>

          {hazard.verified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color="#4ade80" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '600',
  },
});

export default HazardCard;
