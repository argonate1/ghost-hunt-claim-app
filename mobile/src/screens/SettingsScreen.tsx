import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { connectWallet, disconnectWallet, isConnected } = useWallet();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setWalletAddress(data.wallet_address || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveWallet = async () => {
    if (!user) return;

    // Basic Ethereum address validation
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum wallet address (0x...)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress || null })
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Error', 'Failed to update wallet address. Please try again.');
      } else {
        Toast.show({
          type: 'success',
          text1: 'Wallet Updated! 👻',
          text2: 'Your wallet address has been saved successfully.',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wallet address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      Toast.show({
        type: 'success',
        text1: 'Wallet Connected! 🔗',
        text2: 'Your wallet has been connected successfully.',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnectWallet = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnectWallet();
            Toast.show({
              type: 'info',
              text1: 'Wallet Disconnected',
              text2: 'Your wallet has been disconnected.',
            });
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={commonStyles.loadingContainer}>
        <View style={commonStyles.ghostIconLarge}>
          <Text style={styles.ghostEmoji}>⚙️</Text>
        </View>
        <Text style={commonStyles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Ethereum Wallet</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Set your wallet address to receive Ghostcoin rewards
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Wallet Address</Text>
              <TextInput
                style={styles.input}
                placeholder="0x..."
                placeholderTextColor={colors.text.muted}
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelper}>
                Enter your Ethereum wallet address (starts with 0x)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSaveWallet}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Save Wallet Address'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Connection</Text>
          <View style={styles.card}>
            {isConnected ? (
              <View>
                <Text style={styles.cardDescription}>
                  Your wallet is currently connected
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.disconnectButton]}
                  onPress={handleDisconnectWallet}
                >
                  <Text style={styles.buttonText}>Disconnect Wallet</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.cardDescription}>
                  Connect your wallet to check GHOX balance and eligibility
                </Text>
                <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet}>
                  <LinearGradient
                    colors={colors.gradients.cosmic}
                    style={styles.connectButtonGradient}
                  >
                    <Text style={styles.connectButtonText}>Connect Wallet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  value: {
    fontSize: 16,
    color: colors.text.muted,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputHelper: {
    fontSize: 12,
    color: colors.text.muted,
  },
  button: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: colors.warning,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostEmoji: {
    fontSize: 48,
    color: colors.text.primary,
  },
}); 