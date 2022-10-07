import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';
import 'expo-dev-client';

export default function App() {
  return (
    <PaperProvider>
      <MainNavigation></MainNavigation>
    </PaperProvider>
  );
}
