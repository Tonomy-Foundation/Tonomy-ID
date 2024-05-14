/**
 * @desc Reference list of eip155 chains
 * @url https://chainlist.org
 */

/**
 * Types
 */
export type TEIP155Chain = keyof typeof EIP155_CHAINS;

/**
 * Chains
 */
export const EIP155_MAINNET_CHAINS = {
    'eip155:1': {
        chainId: 1,
        name: 'Ethereum',
        logo: '/chain-logos/eip155-1.png',
        rgb: '99, 125, 234',
        rpc: 'https://cloudflare-eth.com/',
    },
};

export const EIP155_TEST_CHAINS = {
    'eip155:11155111': {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        logo: '/chain-logos/eip155-1.png',
        rgb: '99, 125, 234',
        rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    },
};

export const EIP155_CHAINS = { ...EIP155_MAINNET_CHAINS, ...EIP155_TEST_CHAINS };

/**
 * Methods
 */
export const EIP155_SIGNING_METHODS = {
    ETH_SEND_TRANSACTION: 'eth_sendTransaction',
};
