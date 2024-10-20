import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { ErrorState } from '../store/errorStore';
import Debug from 'debug';

const debug = Debug('tonomy-id:utils:exceptions');

export default function setErrorHandlers(errorStore: ErrorState) {
    global.onunhandlPedrejection = function (error) {
        // Warning: when running in "remote debug" mode (JS environment is Chrome browser),
        // this handler is called a second time by Bluebird with a custom "dom-event".
        // We need to filter this case out:
        if (error instanceof Error) {
            errorStore.setError({ error, title: 'Unhandled Promise Rejection Error', expected: false });
        }
    };

    setJSExceptionHandler((e: Error, isFatal) => {
        if (isFatal) {
            errorStore.setError({ error: e, title: 'Unexpected Fatal JS Error', expected: false });
        } else {
            debug('Unexpected JS Error Logs', e, typeof e, JSON.stringify(e, null, 2));

            // @ts-expect-error context does not exist on Error
            if (e?.context?.startsWith('core') && e?.time && e?.level) {
                // Network connection issue with the WalletConnect Core Relay. It will resolve again once internet returns.
                debug('Ignoring WalletConnect Core Relay error', e);
                return;
            }

            errorStore.setError({ error: e, title: 'Unexpected JS Error', expected: false });
        }
    }, false);

    setNativeExceptionHandler((errorString) => {
        errorStore.setError({ error: new Error(errorString), title: 'Unexpected Native Error', expected: false });
    });
}
