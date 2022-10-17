import React from 'react';
import { Provider as PaperProvider, ThemeProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';
import 'expo-dev-client';
import theme from './src/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <PaperProvider>
        <MainNavigation></MainNavigation>
      </PaperProvider>
    </ThemeProvider>
  );
}
