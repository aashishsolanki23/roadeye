import apiClient from './client';
import { Hazard } from '../store/useHazardStore';

export interface FetchHazardsParams {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
}

export interface ReportHazardData {
  type: 'pothole' | 'debris' | 'accident' | 'construction' | 'other';
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  imageBase64?: string;
}

export interface DetectHazardData {
  imageBase64: string;
  latitude: number;
  longitude: number;
}

/**
 * Fetch nearby hazards based on location
 */
export const fetchNearbyHazards = async (
  params: FetchHazardsParams
): Promise<Hazard[]> => {
  try {
    const { latitude, longitude, radius = 5 } = params;
    const response = await apiClient.get('/hazards', {
      params: {
        lat: latitude,
        lon: longitude,
        radius,
      },
    });
    return response.data.hazards || response.data;
  } catch (error) {
    console.error('Failed to fetch hazards:', error);
    throw error;
  }
};

/**
 * Report a new hazard
 */
export const reportHazard = async (
  data: ReportHazardData
): Promise<Hazard> => {
  try {
    const response = await apiClient.post('/hazards/report', data);
    return response.data.hazard || response.data;
  } catch (error) {
    console.error('Failed to report hazard:', error);
    throw error;
  }
};

/**
 * Detect hazard from image using ML API
 */
export const detectHazard = async (
  data: DetectHazardData
): Promise<{ detected: boolean; hazard?: Hazard }> => {
  try {
    const response = await apiClient.post('/hazards/detect', data);
    return response.data;
  } catch (error) {
    console.error('Failed to detect hazard:', error);
    throw error;
  }
};

/**
 * Get hazard details by ID
 */
export const getHazardById = async (id: string): Promise<Hazard> => {
  try {
    const response = await apiClient.get(`/hazards/${id}`);
    return response.data.hazard || response.data;
  } catch (error) {
    console.error('Failed to fetch hazard details:', error);
    throw error;
  }
};

/**
 * Verify a hazard (upvote/confirm)
 */
export const verifyHazard = async (id: string): Promise<void> => {
  try {
    await apiClient.post(`/hazards/${id}/verify`);
  } catch (error) {
    console.error('Failed to verify hazard:', error);
    throw error;
  }
};

/**
 * Delete a hazard (if user is owner or admin)
 */
export const deleteHazard = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/hazards/${id}`);
  } catch (error) {
    console.error('Failed to delete hazard:', error);
    throw error;
  }
};
