import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { Claim, Drop } from '../types/database';
import { formatDistanceToNow } from 'date-fns';

interface ClaimWithDrop extends Claim {
  drop: Drop;
}

export default function ClaimsScreen() {
  const [claims, setClaims] = useState<ClaimWithDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First fetch claims
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });

      if (claimsError) {
        console.error('Error fetching claims:', claimsError);
        Alert.alert('Error', 'Failed to fetch claims');
        return;
      }

      if (!claimsData || claimsData.length === 0) {
        setClaims([]);
        return;
      }

      // Get drop IDs and fetch drop details
      const dropIds = claimsData.map(claim => claim.drop_id);
      const { data: dropsData, error: dropsError } = await supabase
        .from('drops')
        .select('*')
        .in('id', dropIds);

      if (dropsError) {
        console.error('Error fetching drops:', dropsError);
        Alert.alert('Error', 'Failed to fetch drop details');
        return;
      }

      // Combine claims with drop data
      const claimsWithDrops = claimsData.map(claim => {
        const drop = dropsData?.find(d => d.id === claim.drop_id);
        return {
          ...claim,
          drop: drop || {
            id: '',
            title: 'Unknown Drop',
            description: null,
            prize: null,
            drop_id: '',
            created_at: '',
            created_by: '',
            expires_at: null,
            latitude: null,
            longitude: null,
            min_ghox_required: null,
            updated_at: '',
          },
        };
      });

      setClaims(claimsWithDrops);
    } catch (error) {
      console.error('Error fetching claims:', error);
      Alert.alert('Error', 'Failed to fetch claims');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClaims();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'paid':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'paid':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '👻';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.loadingContainer}>
        <View style={commonStyles.ghostIconLarge}>
          <Text style={styles.ghostEmoji}>👻</Text>
        </View>
        <Text style={commonStyles.loadingText}>Loading claims...</Text>
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
          <Text style={styles.title}>My Claims</Text>
          <Text style={styles.subtitle}>Track your ghost hunt rewards</Text>
        </View>

        {/* Claims List */}
        <View style={styles.claimsList}>
          {claims.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={commonStyles.ghostIcon}>
                <Text style={styles.ghostEmoji}>👻</Text>
              </View>
              <Text style={styles.emptyTitle}>No claims yet</Text>
              <Text style={styles.emptySubtitle}>
                Start scanning QR codes to claim ghost rewards!
              </Text>
            </View>
          ) : (
            claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ClaimCard = ({ claim }: { claim: ClaimWithDrop }) => {
  const statusColor = getStatusColor(claim.status);
  const statusIcon = getStatusIcon(claim.status);

  return (
    <View style={styles.claimCard}>
      <View style={styles.claimHeader}>
        <View style={styles.claimTitleContainer}>
          <Text style={styles.claimTitle}>{claim.drop.title}</Text>
          {claim.drop.description && (
            <Text style={styles.claimDescription}>{claim.drop.description}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusIcon}>{statusIcon}</Text>
          <Text style={styles.statusText}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
          </Text>
        </View>
      </View>

      {claim.drop.prize && (
        <View style={styles.prizeContainer}>
          <Text style={styles.prizeLabel}>🏆 Prize</Text>
          <Text style={styles.prizeValue}>{claim.drop.prize}</Text>
        </View>
      )}

      <View style={styles.claimFooter}>
        <Text style={styles.claimTime}>
          Claimed {formatDistanceToNow(new Date(claim.claimed_at))} ago
        </Text>
      </View>

      {claim.admin_notes && (
        <View style={styles.adminNotesContainer}>
          <Text style={styles.adminNotesLabel}>Admin Note:</Text>
          <Text style={styles.adminNotesText}>{claim.admin_notes}</Text>
        </View>
      )}
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'paid':
      return colors.success;
    case 'rejected':
      return colors.error;
    default:
      return colors.mutedForeground;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'paid':
      return '✅';
    case 'rejected':
      return '❌';
    default:
      return '👻';
  }
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
  },
  claimsList: {
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
  claimCard: {
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
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  claimTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  claimTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  claimDescription: {
    fontSize: 14,
    color: colors.text.muted,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  prizeContainer: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  claimFooter: {
    marginBottom: 8,
  },
  claimTime: {
    fontSize: 14,
    color: colors.text.muted,
  },
  adminNotesContainer: {
    backgroundColor: colors.muted,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  ghostEmoji: {
    fontSize: 32,
    color: colors.text.primary,
  },
}); 