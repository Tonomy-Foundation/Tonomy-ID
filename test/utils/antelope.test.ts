import './mocks';
import {
    ActionData,
    AntelopeAccount,
    AntelopeChain,
    AntelopePrivateKey,
    AntelopeToken,
    AntelopeTransaction,
} from '../../src/utils/chain/antelope';
import { PrivateKey } from '@wharfkit/antelope';

describe('AntelopeTransaction', () => {
    const jungleAccountName = 'mytest123tes';
    const privateKey = PrivateKey.from('PVT_K1_2Yn362S23hWaDuDjLawDB1ZByF8fqsZZXFUDPTHnk6tXX44D2R');
    const EOSJungleChain = new AntelopeChain(
        'https://jungle4.cryptolions.io',
        'EOS Jungle Testnet',
        '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true'
    );
    const JUNGLEToken = new AntelopeToken(
        EOSJungleChain,
        'JUNGLE',
        'JUNGLE',
        4,
        'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true',
        'jungle'
    );

    EOSJungleChain.setNativeToken(JUNGLEToken);

    const SIMPLE_ASSSET_CONTRACT_NAME = 'simpleassets';

    it('generate private key and sign transaction', async () => {
        const antelopeKey = new AntelopePrivateKey(privateKey, EOSJungleChain);
        const account = AntelopeAccount.fromAccountAndPrivateKey(EOSJungleChain, jungleAccountName, antelopeKey);

        const createAssetAction: ActionData = {
            account: SIMPLE_ASSSET_CONTRACT_NAME,
            name: 'create',
            authorization: [{ actor: jungleAccountName, permission: 'active' }],
            data: {
                author: jungleAccountName,
                category: 'mycategory',
                owner: jungleAccountName,
                idata: '',
                mdata: '',
                requireclaim: true,
            },
        };
        const actions = [createAssetAction];
        const transaction = AntelopeTransaction.fromActions(actions, EOSJungleChain);

        // getType(): Promise<TransactionType>;
        // getFrom(): Promise<IAccount>;
        // getTo(): Promise<IAccount>;
        // getValue(): Promise<IAsset>;
        // getFunction(): Promise<string>;
        // getArguments(): Promise<Record<string, string>>;
        expect(transaction.hasMultipleOperations()).toBeTruthy();
        expect(await transaction.getData()).toEqual(actions);
        expect(await transaction.getType()).toThrow(
            'Antelope transactions have multiple operations, call getOperations()'
        );
        expect((await transaction.estimateTransactionFee()).toString()).toBe('0.0000 JUNGLE');
        expect((await transaction.estimateTransactionTotal()).toString()).toBe('0.0000 JUNGLE');

        const operations = await transaction.getOperations();
        const createAssetOperation = operations[0];

        expect(operations.length).toBe(1);
        expect(await createAssetOperation.getType()).toBe('contract');
        expect(await createAssetOperation.getFrom()).toEqual(jungleAccountName);
        expect(await createAssetOperation.getTo()).toEqual(SIMPLE_ASSSET_CONTRACT_NAME);
        expect(await createAssetOperation.getValue()).toEqual('0.0000 JUNGLE');
        expect(await createAssetOperation.getFunction()).toEqual('create');
        expect(await createAssetOperation.getArguments()).toEqual({
            author: jungleAccountName,
            category: 'mycategory',
            owner: jungleAccountName,
            idata: '',
            mdata: '',
            requireclaim: true,
        });

        const signedTransaction = await account.signTransaction(transaction);

        // Check if signedTransaction is defined and not empty
        expect(signedTransaction).toBeDefined();
        expect(signedTransaction.id).not.toEqual('');
    }, 30000);
});
