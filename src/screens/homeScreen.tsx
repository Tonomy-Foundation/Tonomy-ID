import TButton from '../components/Tbutton';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {



  return (
    <View style={styles.container}>

      <Text>Home page </Text>
      <TButton onPress={() => navigation.navigate('test')}>Go to Test</TButton>

    </View>
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
