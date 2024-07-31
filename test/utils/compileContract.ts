import * as fs from 'fs';
import * as path from 'path';
import solc from 'solc';

interface SolcInput {
    language: string;
    sources: {
        [key: string]: {
            content: string;
        };
    };
    settings: {
        outputSelection: {
            [key: string]: {
                [key: string]: string[];
            };
        };
    };
}

interface SolcOutput {
    contracts: {
        [key: string]: {
            [key: string]: {
                abi: any[];
                evm: {
                    bytecode: {
                        object: string;
                    };
                };
            };
        };
    };
}

// Path to the Solidity contract
const contractPath = path.resolve(__dirname, 'contracts', 'SimpleStorage.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Compile the contract
const input: SolcInput = {
    language: 'Solidity',
    sources: {
        'SimpleStorage.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

const output: SolcOutput = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['SimpleStorage.sol'].SimpleStorage;

export default contract;
