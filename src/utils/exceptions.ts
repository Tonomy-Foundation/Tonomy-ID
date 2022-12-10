import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { ErrorState } from '../store/errorStore';

export default function setErrorHandlers(errorStore: ErrorState) {
    global.onunhandledrejection = function (error) {
        console.error('onunhandledrejection()', error.reason);

        // Warning: when running in "remote debug" mode (JS environment is Chrome browser),
        // this handler is called a second time by Bluebird with a custom "dom-event".
        // We need to filter this case out:
        if (error instanceof Error) {
            console.error('onunhandledrejection() Error', error.message);
            // TODO report to TF

            errorStore.setError({ error, title: 'Unhandled error', expected: false });
        }
    };

    setJSExceptionHandler((e: Error, isFatal) => {
        console.log('setJSExceptionHandler()', e.message, isFatal);
        console.error(JSON.stringify(e, null, 2));
        // TODO report to TF

        if (isFatal) {
            errorStore.setError({ error, title: 'Unexpected fatal error', expected: false });

            // Alert.alert(
            //     'Unexpected error occurred',
            //     `
            //   Error: ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}
            //   We have reported this to our team ! Please close the app and start again!
            //   `,
            //     [
            //         {
            //             text: 'Close',
            //         },
            //     ]
            // );
        } else {
            errorStore.setError({ error: e, title: 'Unexpected error', expected: false });
        }
    }, false);
    setNativeExceptionHandler((errorString) => {
        console.error(`setNativeExceptionHandler(): ${errorString}`);
        // TODO report to TF
    });
}
