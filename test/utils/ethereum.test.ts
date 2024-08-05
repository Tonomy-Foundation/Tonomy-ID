import arg from 'argon2';
import {
    EthereumAccount,
    EthereumChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    EthereumToken,
    EthereumTransaction,
} from '../../src/utils/chain/etherum';
import { ethers, TransactionRequest } from 'ethers';
import { generatePrivateKeyFromSeed } from '../../src/utils/keys';
import Web3, { AbiItem } from 'web3';
import { abi, bytecode } from '../../contracts/SimpleStorage.json';

const mockarg = arg;
const ganacheUrl = 'http://127.0.0.1:8545';

// ABI of the contract
const contractAbi: AbiItem[] = abi; // Use the actual ABI from the JSON file
const GanacheChain = new EthereumChain(
    ganacheUrl,
    'ganache',
    '1337',
    'https://cryptologos.cc/logos/ethereum-eth-logo.png'
);

const ganacheToken = new EthereumToken(
    GanacheChain,
    'Ganache Token',
    'GNT',
    18,
    'https://example.com/path-to-your-token-logo.png',
    'ganache'
);

GanacheChain.addToken(ganacheToken);

jest.mock('react-native-argon2', () => {
    return {
        __esModule: true,
        default: jest.fn(async (password: string, salt: string, options?) => {
            return mockarg
                .hash(password, {
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
jest.setTimeout(40000);

describe('Ethereum sign transaction', () => {
    let web3;
    let accounts;
    let contractInstance;

    beforeAll(async () => {
        try {
            web3 = new Web3(ganacheUrl);
            accounts = await web3.eth.getAccounts();
            console.log('Ganache accounts:', accounts);

            if (accounts.length === 0) {
                throw new Error('No accounts found from Ganache');
            }
        } catch (error) {
            console.error('Error connecting to Ganache or fetching accounts:', error);
            throw error; // Fail the test if Ganache is not reachable
        }
    });

    // generate key and sign transaction
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

    it('deploy smart contract and send raw transaction', async () => {
        try {
            // Deploy the contract
            contractInstance = await new web3.eth.Contract(contractAbi)
                .deploy({ data: bytecode })
                .send({ from: accounts[0], gas: 1500000, gasPrice: '30000000000' });

            const contractAddress = contractInstance.options.address;
            const data = contractInstance.methods.set(89).encodeABI();

            const account = web3.eth.accounts.create();
            const senderAddress = account.address;
            const senderPrivateKey = account.privateKey;

            const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = 3000000;

            const txParams: TransactionRequest = {
                nonce: Number(web3.utils.toHex(nonce)),
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(gasLimit),
                to: contractAddress,
                data: data,
            };

            const ethereumPrivateKey = new EthereumPrivateKey(senderPrivateKey, GanacheChain);

            // Create an EthereumTransaction instance (if needed)
            const transaction = new EthereumTransaction(txParams, GanacheChain);

            const type = await transaction.getType();

            const isContract = await transaction.getTo().isContract();

            expect(isContract).toEqual(true);
            expect(type).toEqual(0);

            // Sign and send the transaction
            try {
                const signedTransaction = await ethereumPrivateKey.signTransaction(txParams);

                console.log('signedTransaction', signedTransaction);
                expect(signedTransaction).toBeDefined();
                expect(signedTransaction).not.toEqual('');
                expect(signedTransaction).toMatch(/^0x[a-fA-F0-9]+$/);
            } catch (e) {
                console.log('Error sending transaction:', e);
            }
        } catch (error) {
            console.error('Error during transaction creation or sending:', error);
            throw error; // Fail the test if there is an error
        }
    });
});
