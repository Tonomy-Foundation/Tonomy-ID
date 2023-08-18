import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';

// demo sitekey
const siteKey = '31e05fb6-3fff-485e-a9f3-c5d2dd2fb325';
const baseUrl = 'https://hcaptcha.com';

interface HCaptchaHumanState {
  code: string | null;
}

export default class HCaptchaHuman extends React.Component<{}, HCaptchaHumanState> {
  private captchaFormRef = React.createRef<ConfirmHcaptcha>();

  constructor(props: {}) {
    super(props);
    this.state = {
      code: null,
    };
  }

  onMessage = (event: { nativeEvent: { data: string } }) => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        this.captchaFormRef.current?.hide();
        this.setState({ code: event.nativeEvent.data });
        return;
      } else {
        console.log('Verified code from hCaptcha', event.nativeEvent.data);
        this.setState({ code: event.nativeEvent.data });
        setTimeout(() => {
          this.captchaFormRef.current?.hide();
          // do whatever you want here
        }, 1000);
      }
    }
  };

  render() {
    const { code } = this.state;
    return (
      <View style={styles.container}>
        <ConfirmHcaptcha
          ref={this.captchaFormRef}
          siteKey={siteKey}
          baseUrl={baseUrl}
          languageCode="en"
          size="normal"
          onMessage={this.onMessage}
        />
        <TouchableOpacity
          onPress={() => {
            this.captchaFormRef.current?.show();
          }}>
          <Text style={styles.paragraph}>Click to launch</Text>
        </TouchableOpacity>
        {code && (
          <Text style={{ alignSelf: 'center' }}>
            {`passcode or status: `}
            <Text style={{ color: 'darkviolet', fontWeight: 'bold', fontSize: 16 }}>
              {code}
            </Text>
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
