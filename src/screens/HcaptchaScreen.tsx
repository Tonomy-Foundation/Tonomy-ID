import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';

// demo sitekey
const siteKey = '10000000-ffff-ffff-ffff-000000000001';
const baseUrl = 'https://hcaptcha.com';

interface AppState {
  code: string | null;
}

export default class HcaptchaScreen extends React.Component<{}, AppState> {
  private captchaForm: ConfirmHcaptcha | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      code: null,
    };
  }

  onMessage = (event: { nativeEvent: { data: string } }) => {
    if (event && event.nativeEvent.data) {
      if (['cancel'].includes(event.nativeEvent.data)) {
        this.captchaForm?.hide();
        this.setState({ code: event.nativeEvent.data });
      } else if (['error', 'expired'].includes(event.nativeEvent.data)) {
        this.captchaForm?.hide();
        this.setState({ code: event.nativeEvent.data });
      } else {
        console.log('Verified code from hCaptcha', event.nativeEvent.data);
        this.captchaForm?.hide();
        this.setState({ code: event.nativeEvent.data });
      }
    }
  };

  render() {
    const { code } = this.state;
    return (
      <View style={styles.container}>
        <ConfirmHcaptcha
          ref={(ref) => (this.captchaForm = ref)}
          siteKey={siteKey}
          baseUrl={baseUrl}
          languageCode="en"
          onMessage={this.onMessage}
          size="normal"
        />
        <TouchableOpacity
          onPress={() => {
            this.captchaForm?.show();
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
