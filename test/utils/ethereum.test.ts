import arg from 'argon2';
import {
    EthereumAccount,
    EthereumChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    EthereumTransaction,
} from '../../src/utils/chain/etherum';
import { ethers, TransactionRequest } from 'ethers';
import { generatePrivateKeyFromSeed } from '../../src/utils/keys';
import Web3, { AbiItem } from 'web3';

const web3: Web3 = new Web3('http://127.0.0.1:7545');
const mockarg = arg;

// ABI of the contract
const contractAbi: AbiItem[] = [
    // Replace with your contract's ABI
    // Example ABI item for a function
    {
        constant: false,
        inputs: [
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'set',
        outputs: [],
        type: 'function',
    },
];

jest.mock('react-native-argon2', () => {
    return {
        __esModule: true,
        default: jest.fn(async (passowrd: string, salt: string, options?) => {
            return mockarg
                .hash(passowrd, {
                    raw: true,
                    salt: Buffer.from(salt),
                    type: mockarg.argon2id,
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

describe('Ethereum sign transaction', () => {
    //generate key and sign transaction
    it('generate private key and sign transaction', async () => {
        const ethereumKey = await generatePrivateKeyFromSeed('test', EthereumSepoliaChain);
        const exportPrivateKey = await ethereumKey.exportPrivateKey();
        const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey);

        const ethereumAccount = await EthereumAccount.fromPublicKey(
            EthereumSepoliaChain,
            await ethereumPrivateKey.getPublicKey()
        );
        const transactionRequest: TransactionRequest = {
            to: ethereumAccount.getName(),
            from: ethereumAccount.getName(),
            value: ethers.parseEther('0'),
            data: '0x00',
        };

        const signedTransaction = await ethereumPrivateKey.signTransaction(transactionRequest);

        // Check if signedTransaction is defined and not empty
        expect(signedTransaction).toBeDefined();
        expect(signedTransaction).not.toEqual('');

        // Check if signedTransaction is a string in hexadecimal format
        expect(signedTransaction).toMatch(/^0x[a-fA-F0-9]+$/);
    }, 30000);

    it('deploy smart contract send raw transaction', async () => {
        // replace this data with data from your blockchain
        const senderAddress = '0x57e6268C6aD846b2DC89cC1937e29E3Cb4F59f4d';
        const senderPrivateKey = '0x44ae1814e76319f5e363a369760ce2a544fedb7b0f0d4a85bd592300008236d9';
        const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000; // Adjust based on your contract's requirements
        const contractAddress = '0x793f857acE3e94a35bd7E12DfdB1ba3ba0058a24'; // Replace with your contract address
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const data = contract.methods.set(89).encodeABI(); // Replace setValue and 42 with your function and parameters

        const txParams: TransactionRequest = {
            nonce: Number(web3.utils.toHex(nonce)),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: contractAddress,
            data: data,
        };

        const ethereumPrivateKey = new EthereumPrivateKey(senderPrivateKey);

        const transaction = await EthereumTransaction.fromTransaction(
            ethereumPrivateKey,
            txParams,
            EthereumSepoliaChain
        );
        const type = await transaction.getType();

        expect(type).toEqual(expect.any(Number));
        expect(type).toEqual(0);

        const getabi = await transaction.fetchAbi();

        expect(Array.isArray(getabi)).toBe(true);
        expect(getabi[0]).toHaveProperty('name', 'set');
        expect(getabi[0]).toHaveProperty('inputs');

        const getFunction = await transaction.getFunction();

        expect(typeof getFunction).toBe('string');
        expect(getFunction).toBe('set');

        const getArguments = await transaction.getArguments();

        expect(typeof getArguments).toBe('object');
        expect(getArguments).toHaveProperty('x', '89');

        try {
            const signedTransaction = await ethereumPrivateKey.signTransaction(txParams);

            expect(signedTransaction).toBeDefined();
            expect(signedTransaction).not.toEqual('');

            expect(signedTransaction).toMatch(/^0x[a-fA-F0-9]+$/);
            const ethereumAccount = await EthereumAccount.fromPublicKey(
                EthereumSepoliaChain,
                await ethereumPrivateKey.getPublicKey()
            );

            const isCotract = await ethereumAccount.isContract();

            console.log('isCotract', isCotract);
            expect(await ethereumAccount.getName()).toBe(senderAddress);

            const tx = await ethereumAccount.sendSignedTransaction(signedTransaction);

            expect(typeof tx).toBe('string');
        } catch (e) {
            console.log('error', e);
        }
    }, 30000);
});
