import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  successToast: {
    borderLeftColor: colors.success,
  },
  errorToast: {
    borderLeftColor: colors.error,
  },
  infoToast: {
    borderLeftColor: colors.primary,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  toastMessage: {
    fontSize: 14,
    color: colors.text.muted,
  },
});

export { toastConfig }; 