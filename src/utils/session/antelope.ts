import {
    AbiProvider,
    ResolvedSigningRequest,
    SigningRequest,
    SigningRequestEncodingOptions,
} from '@wharfkit/signing-request';
import zlib from 'pako';
import {
    AbstractSession,
    IAccount,
    ISession,
    ITransaction,
    ITransactionRequest,
    LoginApp,
    PlatformType,
} from '../chain/types';
import {
    AntelopeAccount,
    AntelopeChain,
    AntelopePrivateKey,
    AntelopePublicKey,
    AntelopeTransaction,
    AntelopeTransactionReceipt,
    getChainFromAntelopeChainId,
} from '../chain/antelope';
import { APIClient, PrivateKey } from '@wharfkit/antelope';
import ABICache from '@wharfkit/abicache';
import * as SecureStore from 'expo-secure-store';
import useUserStore from '../../store/userStore';
import { createUrl, getQueryParam } from '../strings';
import { v4 as uuidv4 } from 'uuid';

import Debug from 'debug';

const debug = Debug('tonomy-id:utils:session:antelope');

export class AntelopeTransactionRequest implements ITransactionRequest {
    transaction: ITransaction;
    privateKey: AntelopePrivateKey;
    account: IAccount;
    resolvedSigningRequest?: ResolvedSigningRequest;
    session?: ISession;
    origin?: string;

    constructor(transaction: ITransaction, privateKey: AntelopePrivateKey) {
        this.transaction = transaction;
        this.privateKey = privateKey;
    }

    private setAccount(account: IAccount) {
        this.account = account;
    }

    private setSession(session: ISession) {
        this.session = session;
    }

    private setRequest(request: ResolvedSigningRequest) {
        this.resolvedSigningRequest = request;
    }

    static async fromRequest(
        transaction: AntelopeTransaction,
        antelopeKey: AntelopePrivateKey,
        request: ResolvedSigningRequest,
        session: AntelopeSession,
        account: AntelopeAccount
    ): Promise<AntelopeTransactionRequest> {
        const antelopeTransactionRequest = new AntelopeTransactionRequest(transaction, antelopeKey);

        antelopeTransactionRequest.setSession(session);
        antelopeTransactionRequest.setRequest(request);
        antelopeTransactionRequest.setAccount(account);
        return antelopeTransactionRequest;
    }

    static async fromTransaction(
        transaction: ITransaction,
        antelopeKey: AntelopePrivateKey
    ): Promise<AntelopeTransactionRequest> {
        return new AntelopeTransactionRequest(transaction, antelopeKey);
    }

    getOrigin(): string | null {
        const callback = this.resolvedSigningRequest?.request.data.callback;

        return callback ? new URL(callback).origin : null;
    }

    async reject(): Promise<void> {
        if (this.resolvedSigningRequest) {
            const callback = this.resolvedSigningRequest?.request.data.callback;

            if (callback) {
                const origin = new URL(callback).origin;
                const response = await fetch(origin, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        rejected: 'Request cancelled from within Anchor.',
                    }),
                });

                if (!response.ok || response.status !== 200) {
                    console.error(`Failed to send callback: ${JSON.stringify(response)}`);
                }
            }
        }
    }

    async approve(): Promise<AntelopeTransactionReceipt> {
        try {
            const receipt = await this.privateKey.sendTransaction(this.transaction as AntelopeTransaction);

            if (this.session && this.resolvedSigningRequest) {
                const signedTransaction = receipt.getRawTransaction();
                const trxId = receipt.getTransactionHash();
                const callbackParams = this.resolvedSigningRequest.getCallback(signedTransaction.signatures, 0);

                debug('approveTransactionRequest() callbackParams', callbackParams);

                if (callbackParams) {
                    const uid = getQueryParam(callbackParams.url, 'uid');

                    const bodyObject = callbackParams.payload;

                    bodyObject.tx = trxId;
                    // eslint-disable-next-line camelcase
                    bodyObject.tx_id = trxId;
                    bodyObject.uid = uid;

                    // eslint-disable-next-line camelcase
                    const newCallback = createUrl(callbackParams.url, { uid, tx_id: trxId });

                    debug('approveTransactionRequest() callback', new Date(), newCallback, bodyObject);
                    const response = await fetch(newCallback, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyObject),
                    });

                    debug('approveTransactionRequest() response status', response.status);

                    if (!response.ok || response.status !== 200) {
                        console.error(`Failed to send callback: ${JSON.stringify(response)}`);
                    }
                }
            }

            return receipt;
        } catch (e) {
            console.error('Error approving transaction', e);

            await this.reject();
            throw e;
        }
    }
}

export class AntelopeSession extends AbstractSession {
    privateKey: AntelopePrivateKey;
    chain: AntelopeChain;
    client: APIClient;
    publicKey: AntelopePublicKey;
    receiveCh: string;
    accountName: string;

    async initialize(): Promise<void> {
        debug('initialize()');
        await this.getAccountName();
    }

    async fromChain(chain: AntelopeChain): Promise<void> {
        const privateKey = await SecureStore.getItemAsync('tonomy.id.key.PASSWORD');

        if (!privateKey) throw new Error('No private key found');

        const antelopeKey = new AntelopePrivateKey(PrivateKey.from(privateKey), chain);

        this.privateKey = antelopeKey;
        this.publicKey = await antelopeKey.getPublicKey();
        this.chain = chain;
        const receiveChUUID = uuidv4();
        const forwarderAddress = 'https://pangea.web4.world';

        this.receiveCh = `${forwarderAddress}/${receiveChUUID}`;
    }

    private async getAccountName(): Promise<void> {
        const user = useUserStore.getState().user;

        this.accountName = (await user.getAccountName()).toString();
    }

    private async signRequest(data: string): Promise<void> {
        const signingRequestBasic = SigningRequest.from(data, { zlib });

        const chain: AntelopeChain = getChainFromAntelopeChainId(signingRequestBasic.getChainId().toString());
        const client = new APIClient({ url: chain.getApiOrigin() });
        // Define the options used when decoding/resolving the request
        const options: SigningRequestEncodingOptions = {
            abiProvider: new ABICache(client) as unknown as AbiProvider,
            zlib,
        };

        // Decode a signing request payload
        const signingRequest = SigningRequest.from(signingRequestBasic.toString(), options);
        const isIdentity = signingRequest.isIdentity();

        await this.fromChain(chain);

        this.client = client;
        const abis = await signingRequest.fetchAbis();

        const authorization = {
            actor: this.accountName,
            permission: 'active',
        };

        const info = await this.client.v1.chain.get_info();
        const header = info.getTransactionHeader();

        // Resolve the transaction using the supplied data
        const resolvedSigningRequest = await signingRequest.resolve(abis, authorization, header);

        if (isIdentity) {
            this.handleLoginRequest(resolvedSigningRequest);
        } else {
            this.handleTransactionRequest(resolvedSigningRequest);
        }
    }

    async onQrScan(data: string): Promise<void> {
        console.log('onQrScan', data);
        await this.signRequest(data);
    }

    async onLink(data: string): Promise<void> {
        await this.signRequest(data);
    }

    async onEvent(): Promise<void> {
        //TODO when implement listen antelope events
    }

    async handleLoginRequest(resolvedSigningRequest: ResolvedSigningRequest): Promise<void> {
        //TODO when implement handle identity request

        const proof = resolvedSigningRequest.getIdentityProof();
        const callback = resolvedSigningRequest.request.data.callback;

        console.log('sessionConfig', resolvedSigningRequest);
    }

    async handleTransactionRequest(resolvedSigningRequest: ResolvedSigningRequest): Promise<void> {
        const actions = resolvedSigningRequest.resolvedTransaction.actions.map((action) => ({
            account: action.account.toString(),
            name: action.name.toString(),
            authorization: action.authorization.map((auth) => ({
                actor: auth.actor.toString(),
                permission: auth.permission.toString(),
            })),
            data: action.data,
        }));
        const account = AntelopeAccount.fromAccount(this.chain, this.accountName);
        const transaction = AntelopeTransaction.fromActions(actions, this.chain, account);

        const callback = resolvedSigningRequest.request.data.callback;

        new LoginApp('', callback, '', [this.chain]);

        const transactionRequest = await AntelopeTransactionRequest.fromRequest(
            transaction,
            this.privateKey,
            resolvedSigningRequest,
            this,
            account
        );

        this.navigateToTransactionScreen(transactionRequest);
    }
}
