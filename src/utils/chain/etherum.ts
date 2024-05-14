import { ethers, SigningKey, Wallet, TransactionRequest } from 'ethers';
import {
    IPrivateKey,
    IPublicKey,
    KeyType,
    KeyFormat,
    IToken,
    AbstractChain,
    AbstractToken,
    IAccount,
    AbstractAccount,
} from './types';

const infuraKey = 'your-infura-id';
const infuraUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
const provider = new ethers.JsonRpcProvider(infuraUrl);

export class EthereumPublicKey implements IPublicKey {
    private publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    getType(): KeyType {
        return KeyType.secpk1;
    }

    toString(format?: KeyFormat): string {
        return this.publicKey;
    }
}

export class EthereumPrivateKey implements IPrivateKey {
    private privateKey: SigningKey;
    private wallet: Wallet;

    constructor(key: string | SigningKey) {
        if (typeof key === 'string' && !key.startsWith('0x')) {
            key = '0x' + key;
        }

        const signingKey = typeof key === 'string' ? new SigningKey(key) : key;

        this.privateKey = signingKey;
        this.wallet = new Wallet(signingKey, provider);
    }

    getType(): KeyType {
        return KeyType.secpk1;
    }

    toString(format?: KeyFormat): string {
        return this.privateKey.privateKey;
    }

    getPublicKey(): IPublicKey {
        return new EthereumPublicKey(this.privateKey.publicKey);
    }

    signTransaction(transaction: TransactionRequest): Promise<string> {
        return this.wallet.signTransaction(transaction);
    }
}

class EthereumChain extends AbstractChain {
    protected name = 'Ethereum';
    protected chainId = '1';
    protected logoUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
    protected apiEndpoint = infuraUrl;
    protected nativeToken = new ETHToken();
}

class ETHToken extends AbstractToken {
    protected name = 'Ether';
    protected symbol = 'ETH';
    protected precision = 18;
    protected chain = new EthereumChain();
    protected logoUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';

    getUsdPrice(): Promise<number> {
        return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
            .then((res) => res.json())
            .then((data) => data.ethereum.usd);
    }
    getContractAccount(): IAccount | undefined {
        return undefined;
    }
    async getBalance(account?: IAccount): Promise<number> {
        const lookupAccount: IAccount =
            account ||
            this.account ||
            (() => {
                throw new Error('Account not found');
            })();

        const balanceWei = await provider.getBalance(lookupAccount.getName() || '');
        const balanceEther = ethers.formatEther(balanceWei);

        return parseFloat(balanceEther);
    }

    async getUsdValue(account?: IAccount): Promise<number> {
        const balance = await this.getBalance(account);
        const usdPrice = await this.getUsdPrice();

        return balance * usdPrice;
    }
}

class EthereumAccount extends AbstractAccount {
    protected chain = new EthereumChain();
    protected nativeToken = new ETHToken();

    fromPrivateKey(privateKey: EthereumPrivateKey): EthereumAccount {
        const address = privateKey.getPublicKey().toString();

        return this;
    }
}
