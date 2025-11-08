import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '../store/useUserStore';

const ProfileScreen: React.FC = () => {
  const { user, notificationsEnabled, toggleNotifications, logout } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async () => {
    await toggleNotifications();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={48} color="#9ca3af" />
            </View>
          )}
        </View>
        
        <Text style={styles.username}>{user?.username || 'Guest User'}</Text>
        <Text style={styles.email}>{user?.email || 'guest@roadeye.com'}</Text>
        
        {user?.points !== undefined && (
          <View style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star" size={20} color="#fbbf24" />
            <Text style={styles.pointsText}>{user.points} Points</Text>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="alert-circle" size={32} color="#4a90e2" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Hazards Reported</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#4ade80" />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-group" size={32} color="#fbbf24" />
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Helped Drivers</Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="bell" size={24} color="#9ca3af" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Get alerts about nearby hazards
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#374151', true: '#4a90e2' }}
            thumbColor={notificationsEnabled ? '#fff' : '#9ca3af'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#9ca3af" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Alert Radius</Text>
              <Text style={styles.settingSubtitle}>5 km</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#9ca3af" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingSubtitle}>Dark</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="information" size={24} color="#9ca3af" />
            <Text style={styles.settingTitle}>About RoadEye</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#9ca3af" />
            <Text style={styles.settingTitle}>Privacy Policy</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="file-document" size={24} color="#9ca3af" />
            <Text style={styles.settingTitle}>Terms of Service</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#9ca3af" />
            <Text style={styles.settingTitle}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for safer roads</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingTop: 60,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default ProfileScreen;
