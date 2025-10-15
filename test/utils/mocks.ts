import mockArg from 'argon2';

jest.mock('react-native-argon2', () => {
    return {
        __esModule: true,
        default: jest.fn(async (passowrd: string, salt: string, options?) => {
            return mockArg
                .hash(passowrd, {
                    raw: true,
                    salt: Buffer.from(salt),
                    type: mockArg.argon2id,
                    hashLength: 32,
                    memoryCost: 64 * 1024,
                    parallelism: 1,
                    timeCost: 40,
                })
                .then((hash) => {
                    return {
                        rawHash: hash.toString('hex'),
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
