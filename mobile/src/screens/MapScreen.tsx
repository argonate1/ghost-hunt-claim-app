import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useWallet } from '../contexts/WalletContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { Drop } from '../types/database';
import { formatDistanceToNow } from 'date-fns';

const INITIAL_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const { hasMinimumGhox, isConnected } = useWallet();

  useEffect(() => {
    requestLocationPermission();
    fetchDrops();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const fetchDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drops:', error);
        Alert.alert('Error', 'Failed to fetch ghost drops');
      } else {
        setDrops(data || []);
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
      Alert.alert('Error', 'Failed to fetch ghost drops');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrops = drops.filter((drop) => {
    // Filter based on GHOX requirements
    const requiredGhox = drop.min_ghox_required || 0;
    if (requiredGhox === 0) return true;
    return isConnected && hasMinimumGhox(requiredGhox);
  });

  const isExpired = (drop: Drop) => {
    return drop.expires_at && new Date(drop.expires_at) < new Date();
  };

  const handleMarkerPress = (drop: Drop) => {
    setSelectedDrop(drop);
  };

  const closeModal = () => {
    setSelectedDrop(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.loadingContainer}>
        <View style={commonStyles.ghostIconLarge}>
          <Text style={styles.ghostEmoji}>🗺️</Text>
        </View>
        <Text style={commonStyles.loadingText}>Loading ghost map...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ghost Drops Map</Text>
          <Text style={styles.subtitle}>
            {filteredDrops.length} active drop{filteredDrops.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={locationPermission}
            showsMyLocationButton={locationPermission}
            customMapStyle={mapStyle}
          >
            {filteredDrops.map((drop) => (
              <Marker
                key={drop.id}
                coordinate={{
                  latitude: drop.latitude!,
                  longitude: drop.longitude!,
                }}
                onPress={() => handleMarkerPress(drop)}
                opacity={isExpired(drop) ? 0.5 : 1}
              >
                <View style={[styles.marker, isExpired(drop) && styles.expiredMarker]}>
                  <Text style={styles.markerEmoji}>👻</Text>
                </View>
                <Callout tooltip>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{drop.title}</Text>
                    <Text style={styles.calloutTap}>Tap for details</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.marker}>
              <Text style={styles.markerEmoji}>👻</Text>
            </View>
            <Text style={styles.legendText}>Active Ghost Drop</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.marker, styles.expiredMarker]}>
              <Text style={styles.markerEmoji}>👻</Text>
            </View>
            <Text style={styles.legendText}>Expired Drop</Text>
          </View>
        </View>
      </View>

      {/* Drop Details Modal */}
      <Modal
        visible={selectedDrop !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDrop && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedDrop.title}</Text>
                  <Text style={styles.modalEmoji}>👻</Text>
                </View>
                
                {selectedDrop.description && (
                  <Text style={styles.modalDescription}>{selectedDrop.description}</Text>
                )}
                
                {selectedDrop.prize && (
                  <View style={styles.prizeContainer}>
                    <Text style={styles.prizeLabel}>🏆 Prize</Text>
                    <Text style={styles.prizeValue}>{selectedDrop.prize}</Text>
                  </View>
                )}
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    Created {formatDistanceToNow(new Date(selectedDrop.created_at))} ago
                  </Text>
                  
                  {selectedDrop.min_ghox_required && selectedDrop.min_ghox_required > 0 && (
                    <View style={styles.requirementBadge}>
                      <Text style={styles.requirementText}>
                        {selectedDrop.min_ghox_required} GHOX required
                      </Text>
                    </View>
                  )}
                  
                  {isExpired(selectedDrop) && (
                    <View style={styles.expiredBadge}>
                      <Text style={styles.expiredText}>Expired</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.closeButtonGradient}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Dark map style
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
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
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.muted,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  expiredMarker: {
    backgroundColor: colors.mutedForeground,
  },
  markerEmoji: {
    fontSize: 20,
    color: colors.text.primary,
  },
  callout: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 12,
    color: colors.text.muted,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    color: colors.text.muted,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  modalEmoji: {
    fontSize: 28,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text.muted,
    marginBottom: 16,
    lineHeight: 24,
  },
  prizeContainer: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  prizeLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalInfo: {
    marginBottom: 24,
  },
  modalInfoText: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 12,
  },
  requirementBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '600',
  },
  expiredBadge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  expiredText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '600',
  },
  closeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostEmoji: {
    fontSize: 48,
    color: colors.text.primary,
  },
}); 