import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NavItem {
  name: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  activeRoute: string;
  onNavigate: (routeName: string) => void;
}

const navItems: NavItem[] = [
  { name: 'Home', label: 'Map', icon: 'map' },
  { name: 'Detect', label: 'Detect', icon: 'camera' },
  { name: 'Alerts', label: 'Alerts', icon: 'bell' },
  { name: 'Profile', label: 'Profile', icon: 'account' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeRoute, onNavigate }) => {
  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeRoute === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => onNavigate(item.name)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={isActive ? '#4a90e2' : '#9ca3af'}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4a90e2',
    fontWeight: '600',
  },
});

export default BottomNav;
