import { ethers } from './ethers/src.ts';

const msgParams = {
    domain: {
        name: 'Polimec',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000003344'
    },
    message: {
        polimecAccount: '57qwwU823gziGcpWcQB8a3Pycp3a14xCUCPmd75jJXK5QArX',
        projectId: 1,
        nonce: 0,
    },
    types: {
        ParticipationAuthorization: [
            { name: 'polimecAccount', type: 'string' },
            { name: 'projectId', type: 'uint32' },
            { name: 'nonce', type: 'uint32' },
        ]
    }
};
// const domainHash = ethers.TypedDataEncoder.hashDomain(msgParams.domain);
// console.log('Domain Separator:', domainHash);

const structHash = ethers.TypedDataEncoder.hashStruct(
    'ParticipationAuthorization',
    msgParams.types,
    msgParams.message
);
console.log('Message Hash (hashStruct):', structHash);
