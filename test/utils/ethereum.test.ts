import arg from 'argon2';
import {
    EthereumAccount,
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
        const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey, EthereumSepoliaChain);

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
        const senderAddress = '0xd2a010dcC01bF923C9aa329bA88F61428B61e4f2';
        const senderPrivateKey = '0xe75d0d4c927c0848a6c56fc7f20850959157ba109a3c9b0e40818e8ef0bc4a63';
        const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;
        const contractAddress = '0x781DE4eeD3B6f2aaAdB35335e597995E05b0A2d5';
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const data = contract.methods.set(89).encodeABI();

        const txParams: TransactionRequest = {
            nonce: Number(web3.utils.toHex(nonce)),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: contractAddress,
            data: data,
        };

        const ethereumPrivateKey = new EthereumPrivateKey(senderPrivateKey, EthereumSepoliaChain);

        const transaction = await EthereumTransaction.fromTransaction(
            ethereumPrivateKey,
            txParams,
            EthereumSepoliaChain
        );
        const type = await transaction.getType();
        const isContract = await transaction.getTo().isContract();

        expect(isContract).toEqual(true);

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

            expect(await ethereumAccount.getName()).toBe(senderAddress);

            const tx = await ethereumAccount.sendSignedTransaction(signedTransaction);

            expect(typeof tx).toBe('string');
        } catch (e) {
            console.log('error', e);
        }
    }, 30000);
});
