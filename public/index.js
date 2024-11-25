// src/index.ts
var currentAccount = null;
var connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      currentAccount = accounts[0];
      const accountDisplay = document.getElementById("accountDisplay");
      if (accountDisplay) {
        accountDisplay.textContent = `Connected Account: ${currentAccount}`;
      }
      const signButton = document.getElementById("signButton");
      if (signButton) {
        signButton.disabled = false;
      }
      return currentAccount;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
};
var signTypedData = async () => {
  if (!currentAccount) {
    alert("Please connect your wallet first!");
    return;
  }
  const msgParams = {
    domain: {
      name: "Polimec",
      version: "1",
      chainId: 1,
      verifyingContract: "0x0000000000000000000000000000000000003344"
    },
    message: {
      polimecAccount: "5G9FpC41vm1TYruNraJCZHcF5Wfrvny585uWowRJtCB675eR",
      projectId: 1,
      nonce: 1
    },
    primaryType: "ParticipationAuthorization",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      ParticipationAuthorization: [
        { name: "polimecAccount", type: "string" },
        { name: "projectId", type: "uint32" },
        { name: "nonce", type: "uint32" }
      ]
    }
  };
  try {
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [currentAccount, JSON.stringify(msgParams)]
    });
    console.log("Signature:", signature);
    const signatureDisplay = document.getElementById("signatureDisplay");
    if (signatureDisplay) {
      signatureDisplay.innerHTML = `
                <p><strong>Signature:</strong></p>
                <p style="word-break: break-all;">${signature}</p>
            `;
    }
    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    alert("Error signing message");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectButton");
  if (connectButton) {
    connectButton.addEventListener("click", connectWallet);
  }
  const signButton = document.getElementById("signButton");
  if (signButton) {
    signButton.addEventListener("click", signTypedData);
  }
});
