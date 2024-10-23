import { Wallet, getBytes, hashMessage, verifyMessage, toUtf8Bytes } from 'ethers';
import { decodeAddress, cryptoWaitReady } from '@polkadot/util-crypto'; // Import the Polkadot.js utility
import { u8aConcat, bnToU8a, stringToU8a, u8aToHex } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';

const polimecAccount = '57qwwU823gziGcpWcQB8a3Pycp3a14xCUCPmd75jJXK5QArX';
const projectId = 0;
const nonce = 0;



// Concatenate the byte arrays with the ASCII hyphen as a separator
const message = `polimec account: ${polimecAccount} - project id: ${projectId} - nonce: ${nonce}`;
// Set a fixed private key for consistent wallet creation
const privateKey =
	'0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const wallet = new Wallet(privateKey);

const account = wallet.address;
console.log(`hello is ${toUtf8Bytes('hello')}`);
console.log(`len: ${message.length}`); // Get the wallet address
const msgLen = toUtf8Bytes(String(message.length))
console.log(`msgLen {${u8aToHex(msgLen)}}`);
console.log(`msgLen {${msgLen}}`);
const eipCompatibleMessage = hashMessage(message);
const signature = await wallet.signMessage(message);

console.log('Polimec Account (SS58):', polimecAccount);
console.log(
	"Message:",
	message,
);
console.log('EIP-191 Hashed Message:', eipCompatibleMessage);
console.log('Ethereum Account:', account); // Print Ethereum account
console.log('Signature:', signature); // Print the signature


// Verify the Etherum signature
if (getBytes(signature).length === 65) {
	console.log('Signature is 65 bytes long');
} else {
	console.error('Signature length is incorrect:', getBytes(signature).length);
}

const isValidationSuccessful =
	verifyMessage(message, signature) === account;
console.log(
	'Ether.js validation:',
	isValidationSuccessful ? '✅ Success' : 'Failure',
);

// Create Alice based on the development seed, using polkadot.js
await cryptoWaitReady();
const keyring = new Keyring({ type: 'sr25519', ss58Format: 41 });
const alice = keyring.addFromUri('//Alice');

// Sign the message with Alice's private key
const polkadot_signature = alice.sign(message);
const isValid = alice.verify(message, polkadot_signature, alice.publicKey);

if (getBytes(polkadot_signature).length === 64) {
	console.log(
		`✅ The Polkadot.js signature is ${isValid ? 'valid' : 'invalid'}`,
	);
	console.log('Polkadot.js signature:', u8aToHex(polkadot_signature));
	console.log(
		`Signer's address: ${alice.address}, as hex: ${u8aToHex(alice.publicKey)}`,
	);
} else {
	console.error(
		'Polkadot.js signature length is incorrect:',
		getBytes(polkadot_signature).length,
	);
}
