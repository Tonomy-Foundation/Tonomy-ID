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
import { exec } from 'child_process';

const mockarg = arg;
const ganacheUrl = 'http://127.0.0.1:8545';
let ganacheProcess;

// ABI of the contract
const contractAbi: AbiItem[] = abi; // Use the actual ABI from the JSON file
const GanacheChain = new EthereumChain(
    'http://127.0.0.1:8545',
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
        // Start Ganache programmatically
        ganacheProcess = exec('npx ganache-cli -p 8545', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error starting Ganache: ${error.message}`);
            }

            if (stderr) {
                console.error(`Ganache stderr: ${stderr}`);
            }
        });

        // Wait for Ganache to start (increase the delay if needed)
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds

        try {
            web3 = new Web3(ganacheUrl);
            accounts = await web3.eth.getAccounts();
            console.log('Ganache accounts:', accounts);
        } catch (error) {
            console.error('Error connecting to Ganache:', error);
            throw error; // Fail the test if Ganache is not reachable
        }
    });

    afterAll(() => {
        // Kill the Ganache process after tests
        if (ganacheProcess) {
            ganacheProcess.kill();
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

        console.log('txParams', txParams);
        const ethereumPrivateKey = new EthereumPrivateKey(senderPrivateKey, GanacheChain);

        console.log('ethereumPrivateKey', await ethereumPrivateKey.getType());

        // Increase the timeout for ethers.js provider
        const provider = new ethers.JsonRpcProvider(ganacheUrl);

        try {
            await provider.ready;
        } catch (error) {
            console.error('Failed to connect to the network:', error);
            throw error;
        }

        const transaction = await EthereumTransaction.fromTransaction(ethereumPrivateKey, txParams, GanacheChain);

        console.log('transaction', transaction);

        const type = await transaction.getType();
        const isContract = await transaction.getTo().isContract();

        expect(isContract).toEqual(true);
        expect(type).toEqual(0);

        // Sign and send the transaction
        try {
            const signedTransaction = await ethereumPrivateKey.signTransaction(txParams);

            expect(signedTransaction).toBeDefined();
            expect(signedTransaction).not.toEqual('');
            expect(signedTransaction).toMatch(/^0x[a-fA-F0-9]+$/);
        } catch (e) {
            console.log('Error sending transaction:', e);
        }
    });
});
