import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

global.onunhandledrejection = function (error) {
    // Warning: when running in "remote debug" mode (JS environment is Chrome browser),
    // this handler is called a second time by Bluebird with a custom "dom-event".
    // We need to filter this case out:
    if (error instanceof Error) {
        console.error('onunhandledrejection()', error.message);
        // TODO log error
        // logError(error);  // Your custom error logging/reporting code
    }
};

// For most use cases:
// registering the error handler (maybe u can do this in the index.android.js or index.ios.js)
setJSExceptionHandler((error, isFatal) => {
    // This is your custom global error handler
    // You do stuff like show an error dialog
    // or hit google analytics to track crashes
    // or hit a custom api to inform the dev team.
    console.error('setJSExceptionHandler()', error.message, isFatal);
});

//For most use cases:
setNativeExceptionHandler((exceptionString) => {
    // This is your custom global error handler
    // You do stuff likehit google analytics to track crashes.
    // or hit a custom api to inform the dev team.
    //NOTE: alert or showing any UI change via JS
    //WILL NOT WORK in case of NATIVE ERRORS.
    console.error('setNativeExceptionHandler()', exceptionString);
});
