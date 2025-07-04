import React, { useState, useEffect, useMemo } from 'react';
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

  const filteredDrops = useMemo(() => {
    return drops.filter((drop) => {
      // Filter based on GHOX requirements
      const requiredGhox = drop.min_ghox_required || 0;
      if (requiredGhox === 0) return true;
      return isConnected && hasMinimumGhox(requiredGhox);
    });
  }, [drops, isConnected, hasMinimumGhox]);

  const isExpired = (drop: Drop) => {
    return drop.expires_at && new Date(drop.expires_at) < new Date();
  };

  const handleMarkerPress = (drop: Drop) => {
    setSelectedDrop(drop);
  };

  const closeModal = () => {
    setSelectedDrop(null);
  };

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

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.loadingContainer}>
        <Text style={commonStyles.loadingText}>Loading ghost map...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
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
            </Marker>
          ))}
        </MapView>
        
        {/* Simple Modal for Testing */}
        {selectedDrop && (
          <Modal
            visible={true}
            transparent
            animationType="slide"
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedDrop.title || 'Unknown Drop'}</Text>
                
                {selectedDrop.description && (
                  <Text style={styles.modalDescription}>{selectedDrop.description}</Text>
                )}
                
                {selectedDrop.prize && (
                  <View style={styles.prizeContainer}>
                    <Text style={styles.prizeLabel}>🏆 Prize</Text>
                    <Text style={styles.prizeValue}>{selectedDrop.prize}</Text>
                  </View>
                )}
                
                <Text style={styles.modalInfoText}>
                  Created {selectedDrop.created_at ? formatDistanceToNow(new Date(selectedDrop.created_at)) : 'unknown time'} ago
                </Text>
                
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
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
    paddingTop: 0,
    marginTop: 0,
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
  markerEmoji: {
    fontSize: 20,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text.primary,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  prizeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 5,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalInfoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 10,
    marginBottom: 15,
  },
  expiredMarker: {
    backgroundColor: colors.secondary, // Example color for expired drops
  },
}); 