import VeriffSdk from '@veriff/react-native-sdk';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';
import settings from '../settings';
import { Props } from '../screens/KycOnboardingScreen';

const debug = Debug('tonomy-id:veriff');

const VERIFF_API_KEY = settings.config.veriffApiKey;
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
        console.log('Failed to create Veriff session:', error);
        throw error;
    }
}

function showError(error: string, navigation: Props['navigation']) {
    console.error('Veriff error:', error);

    useErrorStore.getState().setError({ error: new Error(error), expected: false });
    navigation.navigate('VeriffLogin');
}

/**
 * Launches the Veriff verification flow using a session URL
 */
export async function launchVeriffVerification(
    verificationURL: string,
    navigation: Props['navigation']
): Promise<boolean> {
    try {
        debug('Launching Veriff verification flow...');
        const result = await VeriffSdk.launchVeriff({ sessionUrl: verificationURL });

        switch (result.status) {
            case VeriffSdk.statusDone:
                debug('Veriff verification completed.');
                return true;

            case VeriffSdk.statusCanceled:
                showError('Veriff verification was canceled by the user.', navigation);
                return false;

            case VeriffSdk.statusError:
                showError(`Failed to create Veriff session: Veriff returned an error: ${result.error}`, navigation);
                return false;

            default:
                showError(
                    `Failed to create Veriff session: Veriff returned unknown status: ${result.status}`,
                    navigation
                );
                return false;
        }
    } catch (error) {
        showError('Failed to create Veriff session: launch', navigation);
        return false;
    }
}

/**
 * Handles the full Veriff flow if verification is required
 */
export async function handleVeriffIfRequired(jwt: string, navigation: Props['navigation']): Promise<boolean> {
    const verificationURL = await createVeriffSession(jwt);

    if (!verificationURL) {
        debug('Could not obtain Veriff session URL. Verification failed.');
        showError('Could not obtain Veriff session URL. Verification failed.', navigation);
        return false;
    }

    return await launchVeriffVerification(verificationURL, navigation);
}
