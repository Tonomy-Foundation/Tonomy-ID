import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Button } from 'react-native-paper';
import TMYButton from './src/components/tmy-button';
export default function App() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app! </Text>
        <TMYButton>test</TMYButton>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
