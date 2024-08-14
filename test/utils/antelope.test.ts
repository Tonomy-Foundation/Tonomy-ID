import './mocks';
import {
    ActionData,
    AntelopeAccount,
    AntelopeChain,
    AntelopePrivateKey,
    AntelopeTransaction,
} from '../../src/utils/chain/antelope';
import { AnyAction, PrivateKey } from '@wharfkit/antelope';

describe('AntelopeTransaction', () => {
    const jungleAccountName = 'mytest123tes';
    const privateKey = PrivateKey.from('PVT_K1_2Yn362S23hWaDuDjLawDB1ZByF8fqsZZXFUDPTHnk6tXX44D2R');
    const EOSJungleChain = new AntelopeChain(
        'https://jungle4.cryptolions.io',
        'EOS Jungle Testnet',
        '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true'
    );

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

        const transaction = AntelopeTransaction.fromActions([createAssetAction], EOSJungleChain);
        const signedTransaction = await account.signTransaction(transaction);

        // Check if signedTransaction is defined and not empty
        expect(signedTransaction).toBeDefined();
        expect(signedTransaction.id).not.toEqual('');
    }, 30000);
});
