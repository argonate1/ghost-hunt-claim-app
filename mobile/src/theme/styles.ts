import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const commonStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  cardContent: {
    flex: 1,
  },
  
  // Text Styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  
  body: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  
  caption: {
    fontSize: 14,
    color: colors.text.muted,
    lineHeight: 20,
  },
  
  // Button Styles
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  
  // Input Styles
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginVertical: 8,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  spacer: {
    flex: 1,
  },
  
  // Spacing
  marginTop: {
    marginTop: 16,
  },
  
  marginBottom: {
    marginBottom: 16,
  },
  
  marginVertical: {
    marginVertical: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  padding: {
    padding: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    color: colors.text.muted,
    fontSize: 16,
    marginTop: 16,
  },
  
  // Ghost Styles
  ghostIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  
  ghostIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  
  // Badge Styles
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  badgeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // List Styles
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  listItem: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
}); 