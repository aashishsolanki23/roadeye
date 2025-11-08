import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useHazardStore } from '../store/useHazardStore';
import { detectHazard, reportHazard } from '../api/hazards';
import { requestCameraPermission, requestLocationPermission } from '../utils/permissions';

const DetectScreen: React.FC = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  
  const { setIsDetecting: setStoreDetecting, addHazard } = useHazardStore();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const camera = await requestCameraPermission();
    const location = await requestLocationPermission();
    setHasPermission(camera.granted && location.granted);
  };

  const captureAndDetect = async () => {
    if (!cameraRef.current) return;

    setIsDetecting(true);
    setStoreDetecting(true);

    try {
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      setCapturedImage(photo.uri);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Send to ML detection API
      if (photo.base64) {
        const result = await detectHazard({
          imageBase64: photo.base64,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setDetectionResult(result);

        if (result.detected && result.hazard) {
          Alert.alert(
            'Hazard Detected!',
            `Type: ${result.hazard.type}\nSeverity: ${result.hazard.severity}\n\nWould you like to report this hazard?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Report',
                onPress: () => handleReportHazard(result.hazard),
              },
            ]
          );
        } else {
          Alert.alert('No Hazard Detected', 'No road hazards were found in the image.');
        }
      }
    } catch (error) {
      console.error('Detection failed:', error);
      Alert.alert('Error', 'Failed to detect hazard. Please try again.');
    } finally {
      setIsDetecting(false);
      setStoreDetecting(false);
    }
  };

  const handleReportHazard = async (hazard: any) => {
    try {
      const reportedHazard = await reportHazard({
        type: hazard.type,
        latitude: hazard.latitude,
        longitude: hazard.longitude,
        severity: hazard.severity,
        description: `Auto-detected: ${hazard.type}`,
        imageBase64: capturedImage || undefined,
      });

      addHazard(reportedHazard);
      Alert.alert('Success', 'Hazard reported successfully!');
      
      // Reset state
      setCapturedImage(null);
      setDetectionResult(null);
    } catch (error) {
      console.error('Failed to report hazard:', error);
      Alert.alert('Error', 'Failed to report hazard. Please try again.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setDetectionResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#9ca3af" />
        <Text style={styles.permissionText}>
          Camera and location permissions are required
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        
        {detectionResult && (
          <View style={styles.resultOverlay}>
            <Text style={styles.resultText}>
              {detectionResult.detected
                ? `✓ ${detectionResult.hazard.type.toUpperCase()} Detected`
                : '✗ No Hazard Detected'}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={retakePhoto}>
            <MaterialCommunityIcons name="camera-retake" size={24} color="#fff" />
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="crosshairs" size={32} color="#4a90e2" />
            <Text style={styles.headerText}>Point camera at road hazard</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureAndDetect}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="camera" size={40} color="#fff" />
              )}
            </TouchableOpacity>
            
            {isDetecting && (
              <Text style={styles.detectingText}>Analyzing...</Text>
            )}
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 60,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4a90e2',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 40,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 40,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 40,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 40,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    gap: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  detectingText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  permissionText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 32,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  resultOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
});

export default DetectScreen;
