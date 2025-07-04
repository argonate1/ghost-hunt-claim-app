import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatUnits } from 'viem';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { Drop } from '../types/database';
import { DropCard } from '../components/DropCard';

export default function DashboardScreen() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { isConnected, ghoxBalance, isLoading: walletLoading } = useWallet();

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          
          {isConnected && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Your $GHOX Balance:</Text>
              <View style={styles.balanceValueContainer}>
                {walletLoading ? (
                  <ActivityIndicator size="small" color={colors.text.primary} />
                ) : (
                  <Text style={styles.balanceValue}>
                    {ghoxBalance ? Number(formatUnits(ghoxBalance, 18)).toLocaleString() : '0'}
                  </Text>
                )}
              </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginBottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 56,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
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
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.text.muted,
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dropsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
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
  ghostEmoji: {
    fontSize: 32,
    color: colors.text.primary,
  },
}); 