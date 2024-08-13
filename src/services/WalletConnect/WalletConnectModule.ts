// WalletConnectModule.js
import { formatJsonRpcError } from '@json-rpc-tools/utils';
import { getSdkError } from '@walletconnect/utils';

export function rejectRequest(request) {
    const { id } = request;

    return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message);
}
