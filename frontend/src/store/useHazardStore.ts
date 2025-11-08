import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Hazard {
  id: string;
  type: 'pothole' | 'debris' | 'accident' | 'construction' | 'other';
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  reportedBy?: string;
  timestamp: string;
  distance?: number;
  imageUrl?: string;
  verified: boolean;
}

interface HazardState {
  hazards: Hazard[];
  nearbyHazards: Hazard[];
  isDetecting: boolean;
  isLoading: boolean;
  lastFetch: number | null;
  cacheExpiry: number; // milliseconds
  
  // Actions
  setHazards: (hazards: Hazard[]) => void;
  setNearbyHazards: (hazards: Hazard[]) => void;
  addHazard: (hazard: Hazard) => void;
  setIsDetecting: (isDetecting: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  loadCachedHazards: () => Promise<void>;
  cacheHazards: (hazards: Hazard[]) => Promise<void>;
  shouldRefetch: () => boolean;
  clearHazards: () => void;
}

export const useHazardStore = create<HazardState>((set, get) => ({
  hazards: [],
  nearbyHazards: [],
  isDetecting: false,
  isLoading: false,
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes

  setHazards: (hazards) => {
    set({ hazards, lastFetch: Date.now() });
  },

  setNearbyHazards: (hazards) => {
    set({ nearbyHazards: hazards });
  },

  addHazard: (hazard) => {
    set((state) => ({
      hazards: [hazard, ...state.hazards],
      nearbyHazards: [hazard, ...state.nearbyHazards],
    }));
  },

  setIsDetecting: (isDetecting) => set({ isDetecting }),

  setIsLoading: (isLoading) => set({ isLoading }),

  loadCachedHazards: async () => {
    try {
      const cachedData = await AsyncStorage.getItem('cachedHazards');
      if (cachedData) {
        const { hazards, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Only use cache if it's not expired
        if (now - timestamp < get().cacheExpiry) {
          set({ hazards, lastFetch: timestamp });
        }
      }
    } catch (error) {
      console.error('Failed to load cached hazards:', error);
    }
  },

  cacheHazards: async (hazards) => {
    try {
      const cacheData = {
        hazards,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('cachedHazards', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache hazards:', error);
    }
  },

  shouldRefetch: () => {
    const { lastFetch, cacheExpiry } = get();
    if (!lastFetch) return true;
    return Date.now() - lastFetch > cacheExpiry;
  },

  clearHazards: () => {
    set({ hazards: [], nearbyHazards: [], lastFetch: null });
  },
}));
