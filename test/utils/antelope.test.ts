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
import { TransactionType } from '../../src/utils/chain/types';

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
                requireclaim: false,
            },
        };
        const actions = [createAssetAction];
        const transaction = AntelopeTransaction.fromActions(actions, EOSJungleChain);

        expect(transaction.hasMultipleOperations()).toBeTruthy();
        expect(await transaction.getData()).toEqual(actions);
        expect(transaction.getType()).rejects.toThrow(
            'Antelope transactions have multiple operations, call getOperations()'
        );
        expect((await transaction.estimateTransactionFee()).toString()).toBe('0 JUNGLE');
        expect((await transaction.estimateTransactionTotal()).toString()).toBe('0 JUNGLE');

        const operations = await transaction.getOperations();
        const createAssetOperation = operations[0];

        expect(operations.length).toBe(1);
        expect(await createAssetOperation.getType()).toBe(TransactionType.CONTRACT);
        expect((await createAssetOperation.getFrom()).getName()).toEqual(jungleAccountName);
        expect((await createAssetOperation.getTo()).getName()).toEqual(SIMPLE_ASSSET_CONTRACT_NAME);
        expect((await createAssetOperation.getValue()).toString()).toEqual('0 JUNGLE');
        expect(await createAssetOperation.getFunction()).toEqual('create');
        expect(await createAssetOperation.getArguments()).toEqual({
            author: jungleAccountName,
            category: 'mycategory',
            owner: jungleAccountName,
            idata: '',
            mdata: '',
            requireclaim: false,
        });

        const signedTransaction = await account.signTransaction(transaction);

        expect(signedTransaction).toBeDefined();
        expect(signedTransaction.signatures.length).toBe(1);

        const res = await account.sendTransaction(transaction);

        expect(res).toBeDefined();
        expect(res.processed.receipt.status).toBe('executed');
        const assetId = res.processed.action_traces[0].inline_traces[1].act.data.assetid;

        expect(assetId).toBeDefined();
        expect(Number(assetId)).toBeGreaterThan(0);

        // Burn the asset to clear up RAM
        const burnAssetAction: ActionData = {
            account: SIMPLE_ASSSET_CONTRACT_NAME,
            name: 'burn',
            authorization: [{ actor: jungleAccountName, permission: 'active' }],
            data: {
                owner: jungleAccountName,
                assetids: [assetId],
                memo: 'burning asset',
            },
        };

        const res2 = await account.sendTransaction(AntelopeTransaction.fromActions([burnAssetAction], EOSJungleChain));

        expect(res2).toBeDefined();
        expect(res2.processed.receipt.status).toBe('executed');
    }, 30000);
});
