import {clusterApiUrl, Connection, Keypair} from "@solana/web3.js";
import bs58 from "bs58";

 const secretKey =
    "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"

export const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey))
export const solanaConnection = new Connection(clusterApiUrl("devnet")) //new Connection(endpoint);