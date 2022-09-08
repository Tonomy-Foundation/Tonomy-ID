import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import TButton from './src/components/Tbutton';
import Ttextinput from './src/components/Ttextinput';


export default function App() {
  return (
    <PaperProvider>
<<<<<<< HEAD

      <Appbar.Header>
        <Appbar.BackAction onPress={() => { }} />
        <Appbar.Content title="Create Account" />
      </Appbar.Header>

=======
>>>>>>> parent of f0ae117... PR 106 comments implemented
      <View style={styles.container}>

      <Ttextinput>Username</Ttextinput>
      <Ttextinput>Password</Ttextinput>
      <Ttextinput>Confirm Password</Ttextinput>

        <TButton>Create Account</TButton>
        
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
