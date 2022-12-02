import { Alert } from 'react-native';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

export default function setErrorHandlers() {
    global.onunhandledrejection = function (error) {
        console.error('onunhandledrejection()', error.reason);

        // Warning: when running in "remote debug" mode (JS environment is Chrome browser),
        // this handler is called a second time by Bluebird with a custom "dom-event".
        // We need to filter this case out:
        if (error instanceof Error) {
            console.error('onunhandledrejection()', error.message);
            Alert.alert('onunhandledrejection()', `Unhandled Promise Rejection: ${error.message}`, [{ text: 'Close' }]);
            // alert('onunhandledrejection()');
            // TODO log error
            // logError(error);  // Your custom error logging/reporting code
        }
    };

    setJSExceptionHandler((e: Error, isFatal) => {
        console.log('setJSExceptionHandler()', e.message, isFatal);
        console.error(JSON.stringify(e, null, 2));
        // e.stack, e.message, e.cause, e.name
        if (isFatal) {
            Alert.alert(
                'Unexpected error occurred',
                `
              Error: ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}
              We have reported this to our team ! Please close the app and start again!
              `,
                [
                    {
                        text: 'Close',
                    },
                ]
            );
        }
    }, true);

    setNativeExceptionHandler((errorString) => {
        console.error(`setNativeExceptionHandler(): ${errorString}`);
    });
}
