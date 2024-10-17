import { Wallet, getBytes } from "ethers";
import { parseArgs } from "util";
import { encodeHex } from "@std/encoding/hex";

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

const messageHex = encodeHex(values.message.trim());
const wallet = Wallet.createRandom();
const account = wallet.address;
const messageBytes = getBytes(`0x${messageHex}`);
const signature = await wallet.signMessage(messageBytes);

console.log("Message:", messageHex);
console.log("Account:", account);
console.log("Signature:", signature);
