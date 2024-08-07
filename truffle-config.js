module.exports = {
    networks: {
        development: {
            host: '127.0.0.1',
            port: 7545, // Default Ganache CLI port
            // eslint-disable-next-line camelcase
            network_id: '5777', // Match any network id
        },
    },
    // Specify compiler version for Solidity
    compilers: {
        solc: {
            version: '0.8.0', // Use Solidity version 0.8.0
        },
    },
    // Other configurations...
};
