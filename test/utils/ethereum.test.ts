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

import ganache from 'ganache-cli';
import { abi, bytecode } from '../../contracts/SimpleStorage.json';

const mockarg = arg;

// ABI of the contract
const contractAbi: AbiItem[] = abi; // Use the actual ABI from the JSON file
const GanacheChain = new EthereumChain(
    `http://127.0.0.1:7545`,
    'ganache',
    '1337',
    'https://cryptologos.cc/logos/ethereum-eth-logo.png'
);

const ganacheToken = new EthereumToken(
    GanacheChain, // Replace with your local chain identifier if needed
    'Ganache Token', // The name of your test token
    'GNT', // The symbol of your test token
    18, // Decimals, usually 18 for ERC-20 tokens
    'https://example.com/path-to-your-token-logo.png', // URL to your token's logo (can be a placeholder)
    'ganache' // An identifier for your test token
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
jest.setTimeout(30000);
describe('Ethereum sign transaction', () => {
    let web3;
    let accounts;
    let contractInstance;

    beforeAll(async () => {
        web3 = new Web3('http://127.0.0.1:7545');
        accounts = await web3.eth.getAccounts();
    });

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

        const ethereumPrivateKey = new EthereumPrivateKey(senderPrivateKey, GanacheChain);

        const transaction = await EthereumTransaction.fromTransaction(ethereumPrivateKey, txParams, GanacheChain);

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
});
