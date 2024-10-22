import { Wallet, getBytes, hashMessage, verifyMessage } from 'ethers';
import { decodeAddress, cryptoWaitReady } from '@polkadot/util-crypto'; // Import the Polkadot.js utility
import { u8aConcat, bnToU8a, stringToU8a, u8aToHex } from '@polkadot/util'; // Utility to handle byte arrays and strings
import { Keyring } from '@polkadot/keyring';

const polimecAccount = '5DdcCTfRRysSRgDyWw49wwfQGJBs4Faif8wuEnj2mNuZgFqd';
const projectId = 0;
const nonce = 0;

// Decode Polimec account from SS58 format
const polimecAccountBytes = decodeAddress(polimecAccount);
// Convert projectId and nonce to byte arrays
const projectIdBytes = bnToU8a(projectId, { bitLength: 32, isLe: true }); // Assuming 32-bit project ID
const nonceBytes = bnToU8a(nonce, { bitLength: 32, isLe: true }); // Assuming 32-bit nonce

// Convert "-" to its ASCII byte representation
const separatorBytes = stringToU8a('-');

// Concatenate the byte arrays with the ASCII hyphen as a separator
const messageBytes = u8aConcat(
	polimecAccountBytes,
	separatorBytes,
	projectIdBytes,
	separatorBytes,
	nonceBytes,
);
const messageHex = u8aToHex(messageBytes);

// Set a fixed private key for consistent wallet creation
const privateKey =
	'0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const wallet = new Wallet(privateKey);

const account = wallet.address; // Get the wallet address
const eipCompatibleMessage = hashMessage(messageBytes);
const signature = await wallet.signMessage(messageBytes);

console.log('Polimec Account (SS58):', polimecAccount);
console.log('Decoded Account Bytes:', polimecAccountBytes);
console.log(
	"Message Bytes (Account + '-' + Project ID + '-' + Nonce):",
	messageHex,
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
	verifyMessage(messageBytes, signature) === account;
console.log(
	'Ether.js validation:',
	isValidationSuccessful ? '✅ Success' : 'Failure',
);

// Create Alice based on the development seed, using polkadot.js
await cryptoWaitReady();
const keyring = new Keyring({ type: 'sr25519', ss58Format: 41 });
const alice = keyring.addFromUri('//Alice');

// Sign the message with Alice's private key
const polkadot_signature = alice.sign(messageBytes);
const isValid = alice.verify(messageBytes, polkadot_signature, alice.publicKey);

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
