import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { Drop, Claim } from '../types/database';
import { formatDistanceToNow } from 'date-fns';
import Toast from 'react-native-toast-message';

interface ClaimWithDrop extends Claim {
  drop: Drop;
  profile: {
    email: string;
  };
}

export default function AdminScreen() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [claims, setClaims] = useState<ClaimWithDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    if (!user) {
      navigation.goBack();
      return;
    }

    try {
      // Check if user has admin role
      const { data: hasAdminRole } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!hasAdminRole) {
        Alert.alert(
          'Access Denied',
          "You don't have permission to access the admin panel.",
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setIsAdmin(true);
      await Promise.all([fetchDrops(), fetchClaims()]);
    } catch (error) {
      console.error('Error checking admin access:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching drops:', error);
      } else {
        setDrops(data || []);
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
    }
  };

  const fetchClaims = async () => {
    try {
      // First fetch claims with drops
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select(`
          *,
          drops (
            title,
            drop_id
          )
        `)
        .order('claimed_at', { ascending: false })
        .limit(20);

      if (claimsError || !claimsData) {
        console.error('Error fetching claims:', claimsError);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(claimsData.map(claim => claim.user_id))];

      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      // Create a lookup map for profiles
      const profilesMap = Object.fromEntries(
        (profilesData || []).map(profile => [profile.user_id, profile])
      );

      // Combine the data
      const mappedClaims = claimsData.map(claim => ({
        ...claim,
        drop: claim.drops as any,
        profile: profilesMap[claim.user_id] || { email: 'Unknown' }
      }));

      setClaims(mappedClaims);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchDrops(), fetchClaims()]).finally(() => {
      setRefreshing(false);
    });
  };

  const updateClaimStatus = async (claimId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status: newStatus })
        .eq('id', claimId);

      if (error) {
        Alert.alert('Error', 'Failed to update claim status.');
      } else {
        Toast.show({
          type: 'success',
          text1: 'Claim Updated',
          text2: `Claim marked as ${newStatus}.`,
        });
        fetchClaims();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update claim status.');
    }
  };

  const handleClaimAction = (claim: ClaimWithDrop, action: string) => {
    Alert.alert(
      'Update Claim',
      `Are you sure you want to mark this claim as ${action}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => updateClaimStatus(claim.id, action),
        },
      ]
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

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.loadingContainer}>
        <View style={commonStyles.ghostIconLarge}>
          <Text style={styles.ghostEmoji}>👑</Text>
        </View>
        <Text style={commonStyles.loadingText}>Loading admin panel...</Text>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return null;
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
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage drops and claims</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to App</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Drops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Recent Drops</Text>
          <Text style={styles.sectionSubtitle}>Latest ghost drops in the system</Text>
          
          {drops.map((drop) => (
            <View key={drop.id} style={styles.dropCard}>
              <View style={styles.dropHeader}>
                <Text style={styles.dropTitle}>{drop.title}</Text>
                <Text style={styles.dropEmoji}>👻</Text>
              </View>
              
              {drop.prize && (
                <View style={styles.prizeContainer}>
                  <Text style={styles.prizeLabel}>🏆 {drop.prize}</Text>
                </View>
              )}
              
              <Text style={styles.dropTime}>
                Created {formatDistanceToNow(new Date(drop.created_at))} ago
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Claims */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👻 Recent Claims</Text>
          <Text style={styles.sectionSubtitle}>Claims requiring review</Text>
          
          {claims.map((claim) => (
            <View key={claim.id} style={styles.claimCard}>
              <View style={styles.claimHeader}>
                <View style={styles.claimInfo}>
                  <Text style={styles.claimTitle}>{claim.drop.title}</Text>
                  <Text style={styles.claimUser}>{claim.profile.email}</Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}
                >
                  <Text style={styles.statusText}>{claim.status}</Text>
                </View>
              </View>
              
              <Text style={styles.claimTime}>
                Claimed {formatDistanceToNow(new Date(claim.claimed_at))} ago
              </Text>
              
              {claim.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleClaimAction(claim, 'paid')}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleClaimAction(claim, 'rejected')}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
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
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.muted,
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    marginHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  dropCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  dropEmoji: {
    fontSize: 20,
  },
  prizeContainer: {
    backgroundColor: colors.muted,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  prizeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dropTime: {
    fontSize: 12,
    color: colors.text.muted,
  },
  claimCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  claimInfo: {
    flex: 1,
  },
  claimTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  claimUser: {
    fontSize: 14,
    color: colors.text.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  claimTime: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  ghostEmoji: {
    fontSize: 48,
    color: colors.text.primary,
  },
}); 