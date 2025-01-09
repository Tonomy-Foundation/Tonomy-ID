import './mocks';
import {
    ActionData,
    AntelopeAccount,
    AntelopePrivateKey,
    AntelopeTransaction,
    EOSJungleChain,
    EOSJungleToken,
} from '../../src/utils/chain/antelope';
import { KeyType, PrivateKey } from '@wharfkit/antelope';
import { TransactionType } from '../../src/utils/chain/types';
import { generatePrivateKeyFromPassword, generateSeedFromPassword } from '../../src/utils/keys';
import { hexToBytes, bytesToHex } from 'did-jwt';

describe('AntelopeTransaction', () => {
    const jungleAccountName = 'mytest123tes';
    const privateKey = PrivateKey.from('PVT_K1_2Yn362S23hWaDuDjLawDB1ZByF8fqsZZXFUDPTHnk6tXX44D2R');

    EOSJungleChain.setNativeToken(EOSJungleToken);

    const SIMPLE_ASSSET_CONTRACT_NAME = 'simpleassets';

    //to resolve powerup error
    // go to https://monitor4.jungletestnet.io/  and press "PowerUp" and put in the account name
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
        const transaction = AntelopeTransaction.fromActions(actions, EOSJungleChain, account);

        expect(transaction.hasMultipleOperations()).toBeTruthy();
        expect(await transaction.getData()).toEqual(actions);
        expect(transaction.getType()).rejects.toThrow(
            'Antelope transactions have multiple operations, call getOperations()'
        );
        expect((await transaction.estimateTransactionFee()).toString()).toBe('0.0000 JungleEOS');
        expect((await transaction.estimateTransactionTotal()).toString()).toBe('0.0000 JungleEOS');

        const operations = await transaction.getOperations();
        const createAssetOperation = operations[0];

        expect(operations.length).toBe(1);
        expect(await createAssetOperation.getType()).toBe(TransactionType.CONTRACT);
        expect((await createAssetOperation.getFrom()).getName()).toEqual(jungleAccountName);
        expect((await createAssetOperation.getTo()).getName()).toEqual(SIMPLE_ASSSET_CONTRACT_NAME);
        expect((await createAssetOperation.getValue()).toString()).toEqual('0.0000 JungleEOS');
        expect(await createAssetOperation.getFunction()).toEqual('create');
        expect(await createAssetOperation.getArguments()).toEqual({
            author: jungleAccountName,
            category: 'mycategory',
            owner: jungleAccountName,
            idata: '',
            mdata: '',
            requireclaim: 'false',
        });

        const signedTransaction = await account.signTransaction(transaction);

        expect(signedTransaction).toBeDefined();
        expect(signedTransaction.signatures.length).toBe(1);

        const res = await account.sendTransaction(transaction);

        const receipt = res.getRawReceipt();

        expect(receipt).toBeDefined();
        expect(receipt.processed.receipt.status).toBe('executed');
        const assetId = receipt.processed.action_traces[0].inline_traces[1].act.data.assetid;

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

        const res2 = await account.sendTransaction(
            AntelopeTransaction.fromActions([burnAssetAction], EOSJungleChain, account)
        );

        const receipt2 = res2.getRawReceipt();

        expect(receipt2).toBeDefined();
        expect(receipt2.processed.receipt.status).toBe('executed');
    }, 30000);
});

describe('AntelopePrivateKey', () => {
    it('Uint8Array conversion', async () => {
        const array = new Uint8Array([1, 2, 3, 4, 5]);
        const hexString = bytesToHex(array);
        const newUint8Array = hexToBytes(hexString);

        expect(newUint8Array).toEqual(array);
    });

    it('can export and import a key using hex string', async () => {
        const privateKey = PrivateKey.generate(KeyType.K1);
        const antelopePrivateKey = new AntelopePrivateKey(privateKey, EOSJungleChain);
        const privateKeyHex = await antelopePrivateKey.exportPrivateKey();
        const newAntelopePrivateKey = await AntelopePrivateKey.fromPrivateKeyHex(privateKeyHex, EOSJungleChain);

        expect(antelopePrivateKey.toPrivateKey().toString()).toEqual(newAntelopePrivateKey.toPrivateKey().toString());
    });
});

describe('AntelopeChain', () => {
    it('createKeyFromSeed() creates the same key as generatePrivateKeyFromPassword()', async () => {
        const passphrase = 'mysecretpassword';
        const { privateKey, salt } = await generatePrivateKeyFromPassword(passphrase);

        const { seed } = await generateSeedFromPassword(passphrase, salt.hexString);
        const antelopePrivateKey = (await EOSJungleChain.createKeyFromSeed(seed)) as AntelopePrivateKey;

        expect(privateKey.toString()).toEqual(antelopePrivateKey.toPrivateKey().toString());
    });
});
