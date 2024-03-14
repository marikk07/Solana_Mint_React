import {
    createBurnCheckedInstruction,
    createMintToCheckedInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token";
import {clusterApiUrl, Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction} from "@solana/web3.js";
import {useState} from "react";
import bs58 from "bs58";


function MintBurn() {
    const endpoint =
        "https://aged-few-gas.solana-devnet.quiknode.pro/709859f8e8b4d80991023ddd417b320d0e139e84/" //Replace with your RPC Endpoint
    const solanaConnection = new Connection(clusterApiUrl("devnet")) //new Connection(endpoint);
    const secretKey =
        "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"
    const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey))

    const [numDecimals, setDecimals] = useState(9);
    const [amount, setAmount] = useState("");
    const [tokenMint, setTokenMint] = useState("");
    async function burnTokens(
        wallet,
        tokenMint, // The mint associated with the token
        amountToBurn // The number of tokens to burn
    ) {
        console.log(`Attempting to burn ${amountToBurn} [${tokenMint}] tokens from Owner Wallet: ${wallet.publicKey.toString()}`);

        // Step 1 - Fetch Associated Token Account Address
        console.log(`Step 1 - Fetch Token Account`);
        const account = await getAssociatedTokenAddress(new PublicKey(tokenMint), wallet.publicKey);
        console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);

        // Step 2 - Create Burn Instructions
        console.log(`Step 2 - Create Burn Instructions`);
        const burnIx = createBurnCheckedInstruction(
            account, // PublicKey of Owner's Associated Token Account
            new PublicKey(tokenMint), // Public Key of the Token Mint Address
            wallet.publicKey, // Public Key of Owner's Wallet
            amountToBurn * (10 ** numDecimals), // Number of tokens to burn
            numDecimals // Number of Decimals of the Token Mint
        );
        console.log(`    ✅ - Burn Instruction Created`);

        // Step 3 - Fetch Blockhash
        console.log(`Step 3 - Fetch Blockhash`);
        const {blockhash, lastValidBlockHeight} = await solanaConnection.getLatestBlockhash('finalized');
        console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

        // Step 4 - Assemble Transaction
        console.log(`Step 4 - Assemble Transaction`);
        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: blockhash,
            instructions: [burnIx]
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([wallet]);
        console.log(`    ✅ - Transaction Created and Signed`);

        // Step 5 - Execute & Confirm Transaction
        console.log(`Step 5 - Execute & Confirm Transaction`);
        const txid = await solanaConnection.sendTransaction(transaction);
        console.log("    ✅ - Transaction sent to network");
        const confirmation = await solanaConnection.confirmTransaction({
            signature: txid,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight
        });
        if (confirmation.value.err) {
            throw new Error("❌ - Transaction not confirmed.")
        }
        console.log('🔥 SUCCESSFUL BURN!🔥', '\n', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    }

    async function mintToken(
        wallet,
        tokenMint, // The mint associated with the token
        amountToBurn // The number of tokens to burn
    ) {
        console.log(`Attempting to minToken2 ${amountToBurn} [${tokenMint}] tokens from Owner Wallet: ${wallet.publicKey.toString()}`);

        // Step 1 - Fetch Associated Token Account Address
        console.log(`Step 1 - Fetch Token Account`);
        const account = await getAssociatedTokenAddress(new PublicKey(tokenMint), wallet.publicKey);
        console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);

        // Step 2 - Create Burn Instructions
        console.log(`Step 2 - Create minToken2 Instructions`);
        const burnIx = createMintToCheckedInstruction(
            new PublicKey(tokenMint),
            account,
            wallet.publicKey,
            amountToBurn * (10 ** numDecimals),
            numDecimals
        );

        console.log(`    ✅ - minToken2 Instruction Created`);

        // Step 3 - Fetch Blockhash
        console.log(`Step 3 - Fetch Blockhash`);
        const {blockhash, lastValidBlockHeight} = await solanaConnection.getLatestBlockhash('finalized');
        console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

        // Step 4 - Assemble Transaction
        console.log(`Step 4 - Assemble Transaction`);
        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: blockhash,
            instructions: [burnIx]
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([wallet]);
        console.log(`    ✅ - Transaction Created and Signed`);

        // Step 5 - Execute & Confirm Transaction
        console.log(`Step 5 - Execute & Confirm Transaction`);
        const txid = await solanaConnection.sendTransaction(transaction);
        console.log("    ✅ - Transaction sent to network");
        const confirmation = await solanaConnection.confirmTransaction({
            signature: txid,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight
        });
        if (confirmation.value.err) {
            throw new Error("❌ - Transaction not confirmed.")
        }
        console.log('🔥 SUCCESSFUL minToken2!🔥', '\n', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    }

    return (
    <div>
        <h2>Mint & Burn 🔥🔥🔥</h2>
        <div>
            <label htmlFor="Token Mint">Enter TokenMint:</label>
            <input value={tokenMint} onChange={(e) => setTokenMint(e.target.value)}/>
        </div>
        <div className="input-group" style={{textAlign: 'right'}}>
            <label htmlFor="amount">Enter Amount:</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)}/>
            <div style={{height: '10px'}}></div>
        </div>
        <button onClick={async () => await burnTokens(userWallet, tokenMint, amount)}
                style={{marginRight: '10px'}}>Burn
        </button>
        <button onClick={async () => await mintToken(userWallet, tokenMint, amount)}>Mint
        </button>
    </div> );
}

export default MintBurn;
