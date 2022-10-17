import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';
import 'expo-dev-client';
import theme from './src/theme';

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <MainNavigation></MainNavigation>
        </PaperProvider>
    );
}
