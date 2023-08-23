import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';

const siteKey = '00000000-0000-0000-0000-000000000000';
const baseUrl = 'https://hcaptcha.com';

interface Props {
  navigation: any; // Change the type to match your navigation prop type
}

const CreateAccountUsernameContainer: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = useState<string | null>(null);
  const [showChallenge, setShowChallenge] = useState(true)
  const captchaFormRef = useRef<ConfirmHcaptcha | null>(null);

  useEffect(() => {
    if (captchaFormRef.current) {
      captchaFormRef.current.show();
    }
  }, []);

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    if (event && event.nativeEvent.data) {
      const eventData = event.nativeEvent.data;
      if (['cancel', 'error', 'expired'].includes(eventData)) {
        if (captchaFormRef.current) {
          captchaFormRef.current.hide();
        }
        setCode(eventData);
      } else {
        console.log('Verified code from hCaptcha', eventData);
        if (captchaFormRef.current) {
          captchaFormRef.current.hide();
        }
        setCode(eventData);
      }
    }
  };

  return (
    <View style={styles.container}>
         <View style={styles.captchaContainer}>
        <ConfirmHcaptcha
          size="invisible"
          ref={captchaFormRef}
          siteKey={siteKey}
          baseUrl={baseUrl}
          languageCode="en"
          onMessage={onMessage}
          sentry={false}
          showLoading={false}
          passiveSiteKey={showChallenge}
        />
        <Button onPress={()=>setShowChallenge(false)} title="Confirm" />
        {/* Confirm</Button> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  captchaContainer: {
    alignItems: 'center',
  },
});

export default CreateAccountUsernameContainer;
