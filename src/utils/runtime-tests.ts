import { testKeyGenerator } from './keys';
import { Resolver } from '@tonomy/did-resolver';
import { getResolver } from '@tonomy/antelope-did-resolver';
import crossFetch from 'cross-fetch';

async function testAntelopeDid() {
    // @ts-expect-error @tonomy/did-resolver and did-resolver types are incompatible
    const resolver = new Resolver({
        ...getResolver({ fetch: crossFetch as any }),
    });

    console.log('Resolving DID document for did:antelope:eos:eoscanadacom');
    const res = await resolver.resolve('did:antelope:eos:eoscanadacom');

    console.log(res);
    if (!res.didDocument) throw new Error('No DID document found');
    if (res.didDocument.id !== 'did:antelope:eos:eoscanadacom') throw new Error('DID document id incorrect');
}

export async function runTests() {
    await testKeyGenerator();
    await testAntelopeDid();
}
