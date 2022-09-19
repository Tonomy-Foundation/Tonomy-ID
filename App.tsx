// ReferenceError: Can't find variable: TextEncoder
// see https://github.com/uport-project/veramo-website/issues/33#issuecomment-758703382
// solved with https://github.com/hapijs/joi/issues/2141
import 'text-encoding-polyfill';

// ReferenceError: Can't find variable: atob
// solved with https://www.npmjs.com/package/@react-native-anywhere/polyfill-base64
import "@react-native-anywhere/polyfill-base64";

import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';

export default function App() {
  return (
    <PaperProvider>
      <MainNavigation></MainNavigation>
    </PaperProvider>
  );
}
