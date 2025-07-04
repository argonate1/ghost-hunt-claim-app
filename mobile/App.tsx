import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox, AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { toastConfig } from './src/utils/toastConfig';
import 'react-native-url-polyfill/auto';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WalletProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="light" backgroundColor="#1a1a2e" />
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