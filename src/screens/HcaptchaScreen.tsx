import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Hcaptcha from '@hcaptcha/react-native-hcaptcha';

const siteKey = '10000000-ffff-ffff-ffff-000000000001';
const baseUrl = 'https://hcaptcha.com';

const HcaptchaCheckboxScreen: React.FC = () => {
  const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);

  const handleCaptchaComplete = (event: { nativeEvent: { event: string } }) => {
    if (event.nativeEvent.event === 'captchaSolved') {
      setIsCaptchaSolved(true);
    } else {
      setIsCaptchaSolved(false);
    }
  };

  return (
    <View style={styles.container}>
      <Hcaptcha
        size="normal"
        siteKey={siteKey}
        baseUrl={baseUrl}
        languageCode="en"
        onMessage={handleCaptchaComplete}
      />
      <TouchableOpacity
        onPress={() => {
          // Perform some action if the checkbox is checked
          if (isCaptchaSolved) {
            console.log('Checkbox is checked, proceed with action');
          } else {
            console.log('Checkbox is not checked');
          }
        }}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  buttonText: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
  },
});

export default HcaptchaCheckboxScreen;



// import React, {useEffect, useRef, useState} from "react";
// import {Text} from  "react-native";
// import Hcaptcha from '@hcaptcha/react-native-hcaptcha/Hcaptcha';

// export default  function HcaptchaScreen () {
//     const [token, setToken] = useState(null);
//   const captchaRef = useRef(null);

//   const onLoad = () => {
//     // this reaches out to the hCaptcha JS API and runs the
//     // execute function on it. you can use other functions as
//     // documented here:
//     // https://docs.hcaptcha.com/configuration#jsapi
//     captchaRef?.current?.execute();
//   };

//   useEffect(() => {

//     if (token)
//       console.log(`hCaptcha Token: ${token}`);

//   }, [token]);

//   return (
//     <>
//     <Text>Hcaptcha Screen</Text>
//     <form>
//       <Hcaptcha
//         size="normal"
//         siteKey="10000000-ffff-ffff-ffff-000000000001"
//         // onLoad={onLoad}
//         // onVerify={setToken}
//         ref={captchaRef}
//       />
//     </form>
//     </>
    
//   );
// }

// import React, { useState, useRef } from 'react';
// import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';

// const siteKey = '10000000-ffff-ffff-ffff-000000000001';
// const baseUrl = 'https://hcaptcha.com';

// const HcaptchaScreen: React.FC = () => {
//   const [code, setCode] = useState<string | null>(null);
//   const captchaFormRef = useRef<ConfirmHcaptcha | null>(null);

//   const onMessage = (event: { nativeEvent: { data: string } }) => {
//     if (event && event.nativeEvent.data) {
//       if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
//         captchaFormRef.current?.hide();
//         setCode(event.nativeEvent.data);
//       } else {
//         console.log('Verified code from hCaptcha', event.nativeEvent.data);
//         captchaFormRef.current?.hide();
//         setCode(event.nativeEvent.data);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ConfirmHcaptcha
//         size = "normal"
//         ref={captchaFormRef}
//         siteKey={siteKey}
//         baseUrl={baseUrl}
//         languageCode="en"
//         onMessage={onMessage}
//       />
//       <TouchableOpacity
//         onPress={() => {
//           captchaFormRef.current?.show();
//         }}>
//         <Text style={styles.paragraph}>Click to launch</Text>
//       </TouchableOpacity>
//       {code && (
//         <Text style={{ alignSelf: 'center' }}>
//           {`passcode or status: `}
//           <Text style={{ color: 'darkviolet', fontWeight: 'bold', fontSize: 16 }}>
//             {code}
//           </Text>
//         </Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: '#ecf0f1',
//     padding: 8,
//   },
//   paragraph: {
//     margin: 24,
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default HcaptchaScreen;
