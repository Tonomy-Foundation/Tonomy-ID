import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { ErrorState } from '../store/errorStore';
import Debug from 'debug';
import { captureError } from './sentry';
import { serializeAny } from './strings';
import { ErrorInfo } from 'react';

const debug = Debug('tonomy-id:utils:exceptions');

export default function setErrorHandlers(errorStore: ErrorState) {
    // http://bluebirdjs.com/docs/api/error-management-configuration.html#global-rejection-events
    global.onunhandledrejection = function (reason: any) {
        debug(
            'Unhandled Promise Rejection Error',
            reason,
            typeof reason,
            reason instanceof Error,
            serializeAny(reason, true)
        );
        const errorObject = reason instanceof Error ? reason : new Error(serializeAny(reason));

        errorStore.setError({ error: errorObject, title: 'Unhandled Promise Rejection Error', expected: false });
    };

    setJSExceptionHandler((e: any, isFatal: boolean) => {
        debug('Unexpected JS Error Logs', isFatal, e, typeof e, e instanceof Error, serializeAny(e, true));
        const error = e instanceof Error ? e : new Error(serializeAny(e));

        if (isFatal) {
            captureError('JS Exception Handler', error, 'fatal');
            errorStore.setError({ error, title: 'Unexpected Fatal JS Error', expected: false });
        } else {
            if (e?.context?.startsWith('core') && e?.time && e?.level) {
                // Network connection issue with the WalletConnect Core Relay. It will resolve again once internet returns.
                debug('Ignoring WalletConnect Core Relay error', error);
                captureError('WalletConnect Core Relay Error', error, 'debug');
                return;
            }

            if (e?.context === 'client') {
                debug('Ignoring WalletConnect Core Client error', error);
                // getting async error throw by the WalletConnect Core client. when the key is MISSING_OR_INVALID or NO_MATCHING_KEY
                // https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/core/src/controllers/store.ts#L160
                captureError('Ignoring WalletConnect Core Client error', e, 'debug');
                return;
            }

            errorStore.setError({ error: e, title: 'Unexpected JS Error', expected: false });
        }
    }, false);

    setNativeExceptionHandler((errorString: string) => {
        debug(
            'Native Exception Handler',
            typeof errorString,
            // @ts-expect-error errorString is a string not Error
            errorString instanceof Error,
            serializeAny(errorString, true)
        );
        captureError('Native Exception Handler', new Error(errorString), 'fatal');
    });
}

export function logErrorBoundaryError(error: Error, info: ErrorInfo) {
    debug('ErrorBoundary Error', error, info);

    // @ts-expect-error info is not a property of Error
    error.info = info;
    captureError('ErrorBoundary', error, 'fatal');
}
