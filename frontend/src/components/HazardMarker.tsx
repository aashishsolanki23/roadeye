import React from 'react';
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Hazard } from '../store/useHazardStore';
import { getHazardSeverityColor, getHazardTypeIcon } from '../utils/formatters';

interface HazardMarkerProps {
  hazard: Hazard;
  onPress?: (hazard: Hazard) => void;
}

const HazardMarker: React.FC<HazardMarkerProps> = ({ hazard, onPress }) => {
  const iconName = getHazardTypeIcon(hazard.type);
  const color = getHazardSeverityColor(hazard.severity);

  return (
    <Marker
      coordinate={{
        latitude: hazard.latitude,
        longitude: hazard.longitude,
      }}
      onPress={() => onPress?.(hazard)}
      tracksViewChanges={false}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        size={32}
        color={color}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 20,
          padding: 6,
          borderWidth: 2,
          borderColor: color,
        }}
      />
    </Marker>
  );
};

export default HazardMarker;
