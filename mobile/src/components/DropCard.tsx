import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { colors } from '../theme/colors';
import { Drop } from '../types/database';

interface DropCardProps {
  drop: Drop;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const DropCard: React.FC<DropCardProps> = ({ drop }) => {
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  
  // Simple null check
  if (!drop) {
    return (
      <View style={styles.dropCard}>
        <Text style={styles.dropTitle}>No drop data</Text>
      </View>
    );
  }

  const handleCardPress = () => {
    setIsDetailsModalVisible(true);
  };

  const closeModal = () => {
    setIsDetailsModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropCard}
        onPress={handleCardPress}
        activeOpacity={0.8}
      >
        <View style={styles.dropHeader}>
          <Text style={styles.dropTitle}>{String(drop.title || 'Untitled Drop')}</Text>
          <Text style={styles.dropEmoji}>👻</Text>
        </View>
        
        {drop.description && (
          <Text style={styles.dropDescription} numberOfLines={2}>
            {String(drop.description)}
          </Text>
        )}
        
        <View style={styles.dropFooter}>
          <Text style={styles.dropTime}>Recently</Text>
          <Text style={styles.viewDetailsText}>Tap to view details →</Text>
        </View>
      </TouchableOpacity>

      {isDetailsModalVisible && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Drop Details</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsGhost}>👻</Text>
                <View style={styles.detailsHeaderText}>
                  <Text style={styles.detailsTitle}>{String(drop.title || 'Untitled Drop')}</Text>
                  <Text style={styles.detailsTime}>Recently</Text>
                </View>
              </View>

              {drop.description && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.sectionContent}>{String(drop.description)}</Text>
                </View>
              )}

              {drop.prize && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Prize</Text>
                  <Text style={styles.sectionContent}>{String(drop.prize)}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  dropFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropTime: {
    fontSize: 14,
    color: colors.text.muted,
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 36,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailsGhost: {
    fontSize: 40,
    marginRight: 16,
  },
  detailsHeaderText: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  detailsTime: {
    fontSize: 16,
    color: colors.text.muted,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
});