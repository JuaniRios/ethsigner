import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
    talismanEth: any;
  }
}

let currentAccount: string | null = null;
let selectedProvider: WalletProvider | null = null;

type WalletProvider = {
  name: string;
  provider: any;
  icon?: string;
};

const waitForTalisman = async (retries = 3, delay = 250): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    if (typeof window.talismanEth !== 'undefined') {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};

const detectWalletProviders = async (): Promise<WalletProvider[]> => {
  const providers: WalletProvider[] = [];
  
  console.log('Checking for wallet providers...');
  
  // Check for MetaMask and Rabby (they use window.ethereum)
  if (typeof window.ethereum !== 'undefined') {
    if (window.ethereum.isMetaMask) {
      console.log('MetaMask detected');
      providers.push({
        name: 'MetaMask',
        provider: window.ethereum
      });
    }
    
    if (window.ethereum.isRabby) {
      console.log('Rabby detected');
      providers.push({
        name: 'Rabby',
        provider: window.ethereum
      });
    }
  }
  
  // Check for Talisman with retry
  const hasTalisman = await waitForTalisman();
  if (hasTalisman) {
    console.log('Talisman detected');
    providers.push({
      name: 'Talisman',
      provider: window.talismanEth
    });
  }
  
  console.log('Detected providers:', providers);
  return providers;
};

const connectWallet = async (provider?: WalletProvider) => {
  const providers = await detectWalletProviders();
  
  if (providers.length === 0) {
    alert('Please install a Web3 wallet (MetaMask, Talisman, or Rabby)!');
    return;
  }

  try {
    // If no provider specified, use the first available one
    selectedProvider = provider || providers[0];
    
    const accounts = await selectedProvider.provider.request({ 
      method: 'eth_requestAccounts' 
    });
    
    currentAccount = accounts[0];
    const accountDisplay = document.getElementById('accountDisplay');
    if (accountDisplay) {
      accountDisplay.textContent = `Connected Account (${selectedProvider.name}): ${currentAccount}`;
    }

    const signButton = document.getElementById('signButton');
    if (signButton) {
      signButton.disabled = false;
    }
    
    return currentAccount;
  } catch (error) {
    console.error(`Error connecting to ${selectedProvider?.name}:`, error);
    alert(`Failed to connect to ${selectedProvider?.name}`);
  }
};

const signTypedData = async () => {
  if (!currentAccount || !selectedProvider) {
    alert('Please connect your wallet first!');
    return;
  }

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
    primaryType: 'ParticipationAuthorization',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      ParticipationAuthorization: [
        { name: 'polimecAccount', type: 'string' },
        { name: 'projectId', type: 'uint32' },
        { name: 'nonce', type: 'uint32' },
      ]
    }
  };

  try {
    const types = {
      ParticipationAuthorization: [
        { name: 'polimecAccount', type: 'string' },
        { name: 'projectId', type: 'uint32' },
        { name: 'nonce', type: 'uint32' },
      ]
    };

    // Step 1: Get domain separator hash
    const domainHash = ethers.TypedDataEncoder.hashDomain(msgParams.domain);
    console.log('Domain Separator:', domainHash);

    // Step 2: Get struct hash
    const structHash = ethers.TypedDataEncoder.hashStruct(
      'ParticipationAuthorization',
      types,
      msgParams.message
    );
    console.log('Message Hash (hashStruct):', structHash);

    // Step 3: Show the raw concatenation before final hash
    // encode(domainSeparator : 𝔹²⁵⁶, message : 𝕊) = "\x19\x01" ‖ domainSeparator ‖ hashStruct(message)
    const concatenated = ethers.concat([
      "0x1901",  // \x19\x01 in hex
      domainHash,
      structHash
    ]);
    console.log('Raw Concatenation (\x19\x01 || domainSeparator || hashStruct):', concatenated);

    // Step 4: Final hash that gets signed (keccak256 of concatenated bytes)
    const finalHash = ethers.keccak256(concatenated);
    console.log('Final Hash to be Signed:', finalHash);

    // Rest of the signing code...
    const signature = await selectedProvider.provider.request({
      method: 'eth_signTypedData_v4',
      params: [currentAccount, JSON.stringify(msgParams)],
    });

    console.log('Signature:', signature);
    
    const signatureDisplay = document.getElementById('signatureDisplay');
    if (signatureDisplay) {
      signatureDisplay.innerHTML = `
        <p><strong>Signature:</strong></p>
        <p style="word-break: break-all;">${signature}</p>
      `;
    }

    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    alert('Error signing message');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const providers = await detectWalletProviders();
  const walletButtons = document.getElementById('walletButtons');
  
  if (walletButtons) {
    providers.forEach(provider => {
      const button = document.createElement('button');
      button.textContent = `Connect ${provider.name}`;
      button.addEventListener('click', () => connectWallet(provider));
      walletButtons.appendChild(button);
    });
  }

  const signButton = document.getElementById('signButton');
  if (signButton) {
    signButton.addEventListener('click', signTypedData);
  }

  console.log('window.talisman:', typeof window.talisman, window.talisman);
}); 