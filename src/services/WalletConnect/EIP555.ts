import 'react-native-get-random-values';
import '@ethersproject/shims';
import { providers, Wallet } from 'ethers';

/**
 * Types
 */
interface IInitArgs {
    mnemonic?: string;
    privateKey?: string;
}

/**
 * Library
 */
export default class EIP155Lib {
    wallet: Wallet;

    constructor(wallet: Wallet) {
        this.wallet = wallet;
    }

    static init({ privateKey }: IInitArgs) {
        const wallet = privateKey ? new Wallet(privateKey) : Wallet.createRandom();

        console.log('wallet', wallet);
        return new EIP155Lib(wallet);
    }

    getMnemonic() {
        console.log('this.wallet.mnemonic.phrase;', this.wallet.mnemonic);
        return this.wallet.mnemonic.phrase;
    }

    getAddress() {
        console.log('this.wallet.mnemonic.phrase;', this.wallet.address);
        return this.wallet.address;
    }

    signMessage(message: string) {
        return this.wallet.signMessage(message);
    }

    _signTypedData(domain: any, types: any, data: any) {
        return this.wallet._signTypedData(domain, types, data);
    }

    connect(provider: providers.JsonRpcProvider) {
        return this.wallet.connect(provider);
    }

    signTransaction(transaction: providers.TransactionRequest) {
        return this.wallet.signTransaction(transaction);
    }
}
