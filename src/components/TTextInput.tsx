import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

export type TTextInputProps = {
  ...React.ComponentProps<typeof TextInput>,
  errorText: string
};

export default function TTextInput(props: TTextInputProps) {
  return (
    <View>
      <TextInput {...props, error: props.errorText.length > 0} />
      {props.errorText.length > 0 && <Text style={styles.errorText}>{props.errorText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
  }
});