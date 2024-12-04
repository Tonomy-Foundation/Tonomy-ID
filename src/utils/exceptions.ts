import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { ErrorState } from '../store/errorStore';
import DebugAndLog from '../utils/debug';
import { captureError } from './sentry';
import Bluebird from 'bluebird';
import { serializeAny } from './strings';

// @ts-expect-error Promise library type mismatch
global.Promise = Bluebird;

const debug = DebugAndLog('tonomy-id:utils:exceptions');

export default function setErrorHandlers(errorStore: ErrorState) {
    // https://stackoverflow.com/a/68633267/28145757
    global.onunhandledrejection = function (reason: any) {
        const errorObject = reason instanceof Error ? reason : new Error(serializeAny(reason));

        errorStore.setError({ error: errorObject, title: 'Unhandled Promise Rejection Error', expected: false });
    };

    setJSExceptionHandler((e: any, isFatal) => {
        const error = e instanceof Error ? e : new Error(serializeAny(e));

        if (isFatal) {
            captureError('JS Exception Handler', error, 'fatal');
            errorStore.setError({ error: error, title: 'Unexpected Fatal JS Error', expected: false });
        } else {
            debug('Unexpected JS Error Logs', error, typeof error, JSON.stringify(error, null, 2));

            if (e?.context?.startsWith('core') && e?.time && e?.level) {
                // Network connection issue with the WalletConnect Core Relay. It will resolve again once internet returns.
                debug('Ignoring WalletConnect Core Relay error', error);
                captureError('WalletConnect Core Relay Error', error, 'debug');
                return;
            }

            errorStore.setError({ error: error, title: 'Unexpected JS Error', expected: false });
        }
    }, false);

    setNativeExceptionHandler((errorString: string) => {
        captureError('Native Exception Handler', new Error(errorString), 'fatal');
    });
}
