import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import Toast from 'react-native-toast-message';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(true); // Start scanning immediately
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);
    handleScan(data);
  };

  const handleScan = async (data: string) => {
    try {
      // Check if the scanned data is a valid drop ID
      const { data: drop, error: dropError } = await supabase
        .from('drops')
        .select('*')
        .eq('drop_id', data)
        .single();

      if (dropError || !drop) {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid ghost drop.', [
          { text: 'OK', onPress: () => stopScanning() }
        ]);
        return;
      }

      // Check if already claimed by this user
      const { data: existingClaim, error: claimError } = await supabase
        .from('claims')
        .select('*')
        .eq('drop_id', drop.id)
        .eq('user_id', user?.id || '')
        .single();

      if (existingClaim) {
        Alert.alert('Already Claimed', 'You have already claimed this ghost drop.', [
          { text: 'OK', onPress: () => stopScanning() }
        ]);
        return;
      }

      // Check if drop has expired
      if (drop.expires_at && new Date(drop.expires_at) < new Date()) {
        Alert.alert('Expired Drop', 'This ghost drop has expired and can no longer be claimed.', [
          { text: 'OK', onPress: () => stopScanning() }
        ]);
        return;
      }

      // Create the claim
      const { error: insertError } = await supabase
        .from('claims')
        .insert({
          drop_id: drop.id,
          user_id: user?.id || '',
          wallet_address: '',
          status: 'pending',
        });

      if (insertError) {
        Alert.alert('Error', 'Failed to claim ghost drop. Please try again.', [
          { text: 'OK', onPress: () => stopScanning() }
        ]);
        return;
      }

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Ghost Claimed! 👻',
        text2: `You've claimed "${drop.title}" successfully!`,
      });

      // Show claim details
      Alert.alert(
        'Ghost Claimed Successfully! 👻',
        `You've claimed "${drop.title}"\n\nPrize: ${drop.prize || 'N/A'}\n\nYour claim is now pending review. You'll be notified when it's approved.`,
        [{ text: 'OK', onPress: () => stopScanning() }]
      );
    } catch (error) {
      console.error('Error processing claim:', error);
      Alert.alert('Error', 'Failed to process claim. Please try again.', [
        { text: 'OK', onPress: () => stopScanning() }
      ]);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProcessing(false);
  };

  const stopScanning = () => {
    navigation.goBack();
  };

  if (!permission) {
    return (
      <SafeAreaView style={commonStyles.centerContainer}>
        <Text style={commonStyles.body}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={commonStyles.centerContainer}>
        <View style={commonStyles.ghostIcon}>
          <Text style={styles.ghostEmoji}>📱</Text>
        </View>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan QR codes for ghost drops.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          
          {/* Camera Overlay - positioned absolutely over the camera */}
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame}>
              <View style={styles.scanCorner} />
              <View style={[styles.scanCorner, styles.topRight]} />
              <View style={[styles.scanCorner, styles.bottomLeft]} />
              <View style={[styles.scanCorner, styles.bottomRight]} />
            </View>
            
            <Text style={styles.scanInstructions}>
              Point your camera at a ghost QR code
            </Text>
            
            <TouchableOpacity style={styles.cancelButton} onPress={stopScanning}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Processing Modal */}
        <Modal visible={processing} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.processingModal}>
              <LinearGradient
                colors={colors.gradients.primary as unknown as readonly [string, string, ...string[]]}
                style={commonStyles.ghostIcon}
              >
                <Text style={styles.ghostEmoji}>👻</Text>
              </LinearGradient>
              <Text style={styles.processingText}>Claiming ghost...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 40,
  },
  scanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '80%',
  },
  scanButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 40,
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
    borderTopLeftRadius: 8,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  scanInstructions: {
    color: colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingModal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  processingText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  ghostEmoji: {
    fontSize: 48,
    color: colors.text.primary,
  },
}); 