import * as mockArg from 'argon2-browser';

jest.mock('argon2-browser', () => {
    return {
        __esModule: true,
        default: jest.fn(async (password: string, salt: string, options?) => {
            return mockArg
                .hash({
                    pass: password,
                    salt,
                    type: mockArg.ArgonType.Argon2id,
                    time: 40,
                    mem: 64 * 1024,
                    parallelism: 1,
                    hashLen: 32,
                })
                .then((hash) => {
                    return {
                        rawHash: hash.hashHex as string,
                        encoded: 'test value',
                    };
                });
        }),
    };
});

jest.mock('expo-secure-store', () => {
    const storage: any = {};

    return {
        setItemAsync: jest.fn(async (key: string, value: string, options) => {
            storage[key] = value;
        }),
        getItemAsync: jest.fn(async (key: string, options) => {
            return storage[key];
        }),
        deleteItemAsync: jest.fn(async (key: string, options) => {
            delete storage[key];
        }),
    };
});

jest.mock('@react-native-async-storage/async-storage', () => {
    const storage: any = {};

    return {
        getItem: jest.fn(async (key: string, callback?) => {
            return storage[key];
        }),

        setItem: jest.fn(async (key: string, value: string, callback?) => {
            storage[key] = value;
        }),

        removeItem: jest.fn(async (key: string, callback?) => {
            delete storage[key];
        }),
    };
});
// }
