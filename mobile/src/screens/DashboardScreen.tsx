import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { Drop } from '../types/database';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardScreen() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { walletAddress, isConnected, connectWallet } = useWallet();

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching drops:', error);
        Alert.alert('Error', 'Failed to fetch drops');
      } else {
        setDrops(data || []);
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
      Alert.alert('Error', 'Failed to fetch drops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDrops();
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.loadingContainer}>
        <View style={commonStyles.ghostIconLarge}>
          <Text style={styles.ghostEmoji}>👻</Text>
        </View>
        <Text style={commonStyles.loadingText}>Loading ghost drops...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ghost Feed</Text>
          <Text style={styles.subtitle}>Latest ghost drops waiting to be claimed</Text>
          
          {/* Wallet Connection */}
          {!isConnected && (
            <TouchableOpacity style={styles.walletButton} onPress={handleConnectWallet}>
              <LinearGradient
                colors={colors.gradients.cosmic as unknown as readonly [string, string, ...string[]]}
                style={styles.walletButtonGradient}
              >
                <Text style={styles.walletButtonText}>🔗 Connect Wallet</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {isConnected && (
            <View style={styles.walletInfo}>
              <Text style={styles.walletAddress}>
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </Text>
            </View>
          )}
        </View>

        {/* Drops List */}
        <View style={styles.dropsList}>
          {drops.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={commonStyles.ghostIcon}>
                <Text style={styles.ghostEmoji}>👻</Text>
              </View>
              <Text style={styles.emptyTitle}>No ghost drops yet</Text>
              <Text style={styles.emptySubtitle}>
                Ghost drops will appear here when they're created
              </Text>
            </View>
          ) : (
            drops.map((drop) => (
              <DropCard key={drop.id} drop={drop} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DropCard = ({ drop }: { drop: Drop }) => {
  const isExpired = drop.expires_at && new Date(drop.expires_at) < new Date();
  
  return (
    <View style={[styles.dropCard, isExpired && styles.expiredCard]}>
      <View style={styles.dropHeader}>
        <Text style={styles.dropTitle}>{drop.title || 'Untitled Drop'}</Text>
        <Text style={styles.dropEmoji}>👻</Text>
      </View>
      
      {drop.description ? (
        <Text style={styles.dropDescription}>{drop.description}</Text>
      ) : null}
      
      {drop.prize ? (
        <View style={styles.prizeContainer}>
          <Text style={styles.prizeLabel}>🏆 Prize</Text>
          <Text style={styles.prizeValue}>{drop.prize}</Text>
        </View>
      ) : null}
      
      <View style={styles.dropFooter}>
        <Text style={styles.dropTime}>
          {formatDistanceToNow(new Date(drop.created_at || Date.now()))} ago
        </Text>
        
        {drop.min_ghox_required && drop.min_ghox_required > 0 ? (
          <View style={styles.requirementBadge}>
            <Text style={styles.requirementText}>
              {drop.min_ghox_required} GHOX required
            </Text>
          </View>
        ) : null}
      </View>
      
      {isExpired ? (
        <View style={styles.expiredOverlay}>
          <Text style={styles.expiredText}>Expired</Text>
        </View>
      ) : null}
    </View>
  );
};

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
    marginBottom: 20,
  },
  walletButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  walletButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  walletButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  walletInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  walletAddress: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  dropsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.muted,
    textAlign: 'center',
  },
  dropCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  expiredCard: {
    opacity: 0.6,
  },
  dropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  dropEmoji: {
    fontSize: 24,
  },
  dropDescription: {
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dropFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropTime: {
    fontSize: 14,
    color: colors.text.muted,
  },
  requirementBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requirementText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '600',
  },
  expiredOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  expiredText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '600',
  },
  ghostEmoji: {
    fontSize: 32,
    color: colors.text.primary,
  },
}); 