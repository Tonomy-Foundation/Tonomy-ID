import Web3, { AbiItem } from 'web3';

const web3: Web3 = new Web3('http://127.0.0.1:7545');

// replace this data with data from your blockchain
const senderAddress = '0x4635eFe40845DEc9002D16E54e00CA186EbEA6f4';
const senderPrivateKey = '0xf098b335474a651263fccb0d298826ea2de944217d11fd68b460db9facf19a12';
const recepientAddress = '0x1aF64E06512789937b6A2CA12Cfb2ed8Da4Bb518';

async function transfer(): Promise<void> {
    // nonce starts at 0 and increments by 1 after each transaction
    console.log('Sending 1 ether from address:', senderAddress, 'to address:', recepientAddress);

    const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
    const gasPrice = await web3.eth.getGasPrice();

    const transaction: any = {
        to: recepientAddress,
        value: web3.utils.toWei('1', 'ether'),
        gas: 30000,
        gasPrice: gasPrice,
        nonce: nonce,
    };

    const signedTx = await web3.eth.accounts.signTransaction(transaction, senderPrivateKey);

    const rawTransaction: string = signedTx.rawTransaction;

    console.log('Nonce for address', senderAddress, 'is:', nonce);
    console.log('Raw transaction:', rawTransaction);

    web3.eth
        .sendSignedTransaction(rawTransaction)
        .on('receipt', function (receipt: any) {
            console.log(
                'The hash of your transaction is: ',
                receipt.transactionHash,
                '\n Check Transactions tab in Ganache to view your transaction!'
            );
        })
        .on('error', function (error: any) {
            console.log('Something went wrong while submitting your transaction:', error);
        });
}

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

async function sendTransaction() {
    const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 3000000; // Adjust based on your contract's requirements
    const contractAddress = '0x09bc5bA11D1DFcc19AB0248573e9Fa8e30Ad4149'; // Replace with your contract address
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    const data = contract.methods.set(42).encodeABI(); // Replace setValue and 42 with your function and parameters

    const transaction = {
        to: contractAddress,
        data: data,
        gas: gasLimit,
        gasPrice: gasPrice,
        nonce: nonce,
    };

    const signedTx = await web3.eth.accounts.signTransaction(transaction, senderPrivateKey);
    const rawTransaction = signedTx.rawTransaction;

    web3.eth
        .sendSignedTransaction(rawTransaction!)
        .on('receipt', function (receipt) {
            console.log('Transaction receipt:', receipt);
        })
        .on('error', function (error) {
            console.error('Error sending transaction:', error);
        });
}

// transfer();
sendTransaction();
