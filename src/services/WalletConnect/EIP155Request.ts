import { EIP155_CHAINS, EIP155_SIGNING_METHODS, TEIP155Chain } from './EIP155MethodsAndChain';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
// import { providers } from 'ethers';
import { currentETHAddress } from './Web3WalletClient';
import { ethers } from 'ethers';

export async function approveEIP155Request(requestEvent: SignClientTypes.EventArguments['session_request']) {
    const { params, id } = requestEvent;
    const { chainId, request } = params;

    switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION: {
            // const provider = new providers.JsonRpcProvider(EIP155_CHAINS[chainId as TEIP155Chain].rpc);
            // const wallet = new ethers.Wallet('privateKey', provider); //TODO update this in sign transaction task
            // const sendTransaction = request.params[0];
            // const connectedWallet = wallet.connect(provider);
            // const { hash } = await connectedWallet.sendTransaction(sendTransaction);
            // return formatJsonRpcResult(id, hash);
            return 'true';
        }

        default:
            throw new Error(getSdkError('INVALID_METHOD').message);
    }
}

export function rejectEIP155Request(request: SignClientTypes.EventArguments['session_request']) {
    const { id } = request;

    return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message);
}
