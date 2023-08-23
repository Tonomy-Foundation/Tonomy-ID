import React, { useState, useRef, RefObject, useEffect } from 'react';
import { Props } from '../screens/HcaptchaScreen';
import { Text, View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import Hcaptcha from '@hcaptcha/react-native-hcaptcha';


const siteKey = '00000000-0000-0000-0000-000000000000';
const baseUrl = 'https://hcaptcha.com';


export default function CreateAccountUsernameContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [code, setCode] = useState<string | null>(null);
    const captchaFormRef: RefObject<ConfirmHcaptcha | null> = useRef(null);
    const hcaptchaRef = React.createRef();

    const handleVerify = async () => {
      if (hcaptchaRef.current) {
        const result = await hcaptchaRef.current.verify();
        if (result.success) {
          // User successfully completed the hCaptcha challenge
          console.log('hCaptcha verification successful');
        } else {
          // User failed or did not complete the hCaptcha challenge
          console.log('hCaptcha verification failed');
        }
      }
    };
    useEffect(() => {
        // if (captchaFormRef.current) {
        //     captchaFormRef.current.show();
        //   }
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
         {/* <Hcaptcha
        ref={hcaptchaRef as React.RefObject<Hcaptcha>}
        siteKey={siteKey}
        onVerify={handleVerify}
      />
      <Button onClick={handleVerify} >Verify</Button> */}
        <ConfirmHcaptcha
          size="normal"
          ref={captchaFormRef as React.RefObject<ConfirmHcaptcha>}
          siteKey={siteKey}
          baseUrl={baseUrl}
          languageCode="en"
          onMessage={onMessage}
        />
        <TouchableOpacity
          onPress={() => {
            if (captchaFormRef.current) {
              captchaFormRef.current.show();
            }
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
  
  