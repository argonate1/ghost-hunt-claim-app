import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import Toast from 'react-native-toast-message';

export default function LandingScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else if (isSignUp) {
        Toast.show({
          type: 'success',
          text1: 'Account Created! 👻',
          text2: 'Welcome to the ghost hunt!',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={commonStyles.ghostIconLarge}
            >
              <Text style={styles.ghostEmoji}>👻</Text>
            </LinearGradient>
            <Text style={styles.title}>Ghostcoin</Text>
            <Text style={styles.subtitle}>Hunt for rewards in the real world</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureCard
              icon="🔍"
              title="Find & Scan"
              description="Seek out hidden QR codes placed in real-world locations"
            />
            <FeatureCard
              icon="🎁"
              title="Claim Rewards"
              description="Be the first to scan and win amazing prizes"
            />
            <FeatureCard
              icon="🏆"
              title="Become a Legend"
              description="Climb the leaderboard and prove your ghost hunting skills"
            />
          </View>

          {/* Auth Form */}
          <View style={styles.authForm}>
            <Text style={styles.authTitle}>
              {isSignUp ? 'Join the Hunt' : 'Welcome Back'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Loading...' : isSignUp ? 'Start Hunting' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  ghostEmoji: {
    fontSize: 48,
    color: colors.text.primary,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.muted,
    textAlign: 'center',
  },
  features: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  authForm: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
}); 