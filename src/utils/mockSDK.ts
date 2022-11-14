import { Checksum256, Name } from '@greymass/eosio';
import { PushTransactionResponse } from '@greymass/eosio/src/api/v1/types';
import { GetPersonResponse, KeyManager, User as TUser } from 'tonomy-id-sdk';
function initialize(storage: any, keymanger: any, settings: any) {
    return new User(storage, keymanger, settings);
}

class User implements TUser {
    storage;
    keyManager: KeyManager;
    settings;
    constructor(storage: any, keymanger: KeyManager, settings: any) {
        this.storage = storage;
        this.keyManager = keymanger;
        this.settings = settings;
    }

    async saveUsername(username: string, suffix: string): Promise<void> {
        return;
    }

    async savePassword(
        masterPassword: string,
        options?: { salt?: Checksum256 | undefined } | undefined
    ): Promise<void> {
        return;
    }
    async savePIN(pin: string): Promise<void> {
        return;
    }
    async saveFingerprint(): Promise<void> {
        return;
    }
    async saveLocal(): Promise<void> {
        return;
    }
    async createPerson(): Promise<PushTransactionResponse> {
        return {
            processed: {
                id: '123',
                block_num: 1,
                account_ram_delta: null,
            },
            transaction_id: '123',
        } as PushTransactionResponse;
    }
    async updateKeys(password: string): Promise<void> {
        return;
    }
    async login(username: string, password: string): Promise<GetPersonResponse> {
        return {
            account_name: Name.from('jack123'),
            type: 1,
            status: 1,
            username_hash: Checksum256.from('123'),
            password_salt: Checksum256.from('123'),
            version: 1,
        };
    }
    async logout(): Promise<void> {
        return;
    }
    async isLoggedIn(): Promise<boolean> {
        return true;
    }
}

type SettingsType = {
    blockchainUrl: string;
};

let settings: SettingsType;
let initialized = false;

function setSettings(newSettings: SettingsType) {
    settings = newSettings;
    initialized = true;
}

async function getSettings(): Promise<SettingsType> {
    if (!initialized) {
        throw new Error('settings not yet intialized');
    }
    return settings;
}

export { getSettings, setSettings, initialize, SettingsType, User };
