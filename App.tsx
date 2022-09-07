import { Provider as PaperProvider } from 'react-native-paper';
import { User } from 'tonomy-id-sdk';
import { useEffect } from 'react';
import MainNavigation from './src/navigation/main';



export default function App() {
  return (
    <PaperProvider>
      <MainNavigation></MainNavigation>
    </PaperProvider>
  );
}

