import VeriffSdk from '@veriff/react-native-sdk';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';

const debug = Debug('tonomy-id:veriff');

const VERIFF_API_KEY = '461a1795-d8b4-4a1f-950a-8f523ff72d0c';
const VERIFF_API_URL = 'https://stationapi.veriff.com/v1/sessions';

/**
 * Creates a Veriff session and returns the session URL
 */
export async function createVeriffSession(jwt: string): Promise<string | null> {
    try {
        debug('Creating Veriff session...');
        debug('jwt', jwt);
        const response = await fetch(VERIFF_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-CLIENT': VERIFF_API_KEY,
            },
            body: JSON.stringify({ verification: { vendorData: jwt } }),
        });

        debug('response', response);

        if (!response.ok) {
            throw new Error(`Veriff session creation failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const verificationURL = data.verification?.url;

        if (!verificationURL) {
            throw new Error('Missing verification URL in Veriff response');
        }

        debug('Veriff session successfully created');
        debug('Verification URL:', verificationURL);
        return verificationURL;
    } catch (error) {
        debug('error', error);
        debug('Failed to create Veriff session:', error);
        useErrorStore.getState().setError({ error, expected: false });
        return null;
    }
}

/**
 * Launches the Veriff verification flow using a session URL
 */
export async function launchVeriffVerification(verificationURL: string): Promise<boolean> {
    try {
        debug('Launching Veriff verification flow...');
        const result = await VeriffSdk.launchVeriff({ sessionUrl: verificationURL });

        switch (result.status) {
            case VeriffSdk.statusDone:
                debug('Veriff verification completed.');
                return true;

            case VeriffSdk.statusCanceled:
                debug('Veriff verification was canceled by the user.');
                return false;

            case VeriffSdk.statusError:
                debug('Veriff returned an error:', result.error);
                useErrorStore.getState().setError({ error: new Error(result.error), expected: false });
                return false;

            default:
                debug('Veriff returned unknown status:', result.status);
                useErrorStore.getState().setError({ error: new Error('Unknown Veriff status'), expected: false });
                return false;
        }
    } catch (error) {
        debug('Exception during Veriff verification:', error);
        useErrorStore.getState().setError({ error, expected: false });
        return false;
    }
}

/**
 * Handles the full Veriff flow if verification is required
 */
export async function handleVeriffIfRequired(jwt: string): Promise<boolean> {
    const verificationURL = await createVeriffSession(jwt);

    if (!verificationURL) {
        debug('Could not obtain Veriff session URL. Verification failed.');
        useErrorStore.getState().setError({
            error: new Error('Could not obtain Veriff session URL. Verification failed.'),
            expected: false,
        });
        return false;
    }

    return await launchVeriffVerification(verificationURL);
}
