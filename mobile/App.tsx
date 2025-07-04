import './polyfills';
import '@walletconnect/react-native-compat';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox, AppRegistry, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { toastConfig } from './src/utils/toastConfig';
import { AppKit } from '@reown/appkit-wagmi-react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
  'The <CameraView> component does not support children',
  'Value being stored in SecureStore is larger than 2048 bytes',
  'Auto refresh tick failed with error',
  'User interaction is not allowed',
  'No matching key',
  'Proposal expired',
  'User rejected methods',
]);

function App() {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is being backgrounded, cleanup any active sessions
        console.log('App backgrounded, cleaning up sessions...');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WalletProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="light" backgroundColor="#1a1a2e" />
          <AppKit />
        </WalletProvider>
      </AuthProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

// Register the app component
AppRegistry.registerComponent('main', () => App);

export default App; 