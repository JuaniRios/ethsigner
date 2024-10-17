import { Wallet, getBytes, hashMessage } from "ethers";
import { parseArgs } from "util";

const defaultMessage = "abcdef123456"; // Replace this with your message

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    message: {
      type: "string",
      default: defaultMessage,
    },
  },
  strict: true,
  allowPositionals: true,
  required: ["message"],
});

const wallet = Wallet.createRandom();
const account = wallet.address;
const messageBytes = getBytes(`0x${values.message}`);
const eipCompatibleMessage = hashMessage(messageBytes).replace("0x", "");
const signature = await wallet.signMessage(messageBytes);

console.log("Input Message:", values.message);
console.log("EIP-191 Hashed Message:", eipCompatibleMessage);
console.log("Account:", account);
console.log("Signature:", signature);
