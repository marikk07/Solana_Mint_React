import logo from './logo.svg';
import './App.css';
import {useState} from "react";
import {
    Transaction,
    SystemProgram,
    Keypair,
    Connection,
    sendAndConfirmTransaction,
    clusterApiUrl,
    PublicKey,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js"
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createInitializeMintInstruction,
    getMinimumBalanceForRentExemptMint,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    createBurnCheckedInstruction
} from "@solana/spl-token"
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata"
import {
    bundlrStorage,
    keypairIdentity,
    Metaplex
} from "@metaplex-foundation/js"
import bs58 from "bs58"



function App() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    ///

    const endpoint =
        "https://aged-few-gas.solana-devnet.quiknode.pro/709859f8e8b4d80991023ddd417b320d0e139e84/" //Replace with your RPC Endpoint
    const solanaConnection = new Connection(clusterApiUrl("devnet")) //new Connection(endpoint);

    const secretKey =
        "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"

    const numDecimals = 6

    const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey)) //Keypair.fromSecretKey(new Uint8Array(secret));
    const metaplex = Metaplex.make(solanaConnection)
        .use(keypairIdentity(userWallet))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: endpoint,
                timeout: 60000
            })
        )

    const MINT_CONFIG = {
        numDecimals: numDecimals,
        numberTokens: 100
    }
    const MY_TOKEN_METADATA = {
        name: "Marikk Token",
        symbol: "MkkT",
        description: "This is my first tok!",
        image:
            "https://images.ctfassets.net/q5ulk4bp65r7/45uk7WZNNBGCHOwlNaGCT4/a4c8897e2cae08e4f42bf56ca6e3ba4b/solona.png" //add public URL to image you'd like to use
    }
    const ON_CHAIN_METADATA = {
        name: "Marikk Token",
        symbol: "MkkT",
        uri: "TO_UPDATE_LATER",
        sellerFeeBasisPoints: 0,
        // @ts-ignore
        creators: null,
        // @ts-ignore
        collection: null,
        // @ts-ignore
        uses: null
    }

    /**
     *
     * @param wallet Solana Keypair
     * @param tokenMetadata Metaplex Fungible Token Standard object
     * @returns Arweave url for our metadata json file
     */
    // const uploadMetadata = async tokenMetadata => {
    //     //Upload to Arweave
    //     console.log(`metaplex`, metaplex);
    //     console.log(`tokenMetadata`, tokenMetadata);
    //     const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata)
    //     console.log(`Arweave URL: `, uri)
    //     return uri
    // }
    const uploadMetadata = async tokenMetadata => {
            //Upload to Arweave
            console.log(`metaplex`, metaplex);
            console.log(`tokenMetadata`, tokenMetadata);
            metaplex.nfts().uploadMetadata(tokenMetadata).then((res) => {
                console.log(`Arweave URL: `, res.uri)
                return res.uri
            })
        }

    const createNewMintTransaction = async (
        connection,
        payer,
        mintKeypair,
        destinationWallet,
        mintAuthority,
        freezeAuthority
    ) => {
        //Get the minimum lamport balance to create a new account and avoid rent payments
        const requiredBalance = await getMinimumBalanceForRentExemptMint(connection)
        //metadata account associated with mint
        const metadataPDA = await metaplex
            .nfts()
            .pdas()
            .metadata({ mint: mintKeypair.publicKey })
        //get associated token account of your wallet
        const tokenATA = await getAssociatedTokenAddress(
            mintKeypair.publicKey,
            destinationWallet
        )

        const createNewTokenTransaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports: requiredBalance,
                programId: TOKEN_PROGRAM_ID
            }),
            createInitializeMintInstruction(
                //Mint Address
                mintKeypair.publicKey, //Number of Decimals of New mint
                MINT_CONFIG.numDecimals, //Mint Authority
                mintAuthority, //Freeze Authority
                freezeAuthority,
                TOKEN_PROGRAM_ID
            ),
            createAssociatedTokenAccountInstruction(
                //Payer
                payer.publicKey, //Associated token account
                tokenATA, //token owner
                payer.publicKey, //Mint
                mintKeypair.publicKey
            ),
            createMintToInstruction(
                //Mint
                mintKeypair.publicKey, //Destination Token Account
                tokenATA, //Authority
                mintAuthority, //number of tokens
                MINT_CONFIG.numberTokens * Math.pow(10, MINT_CONFIG.numDecimals)
            ),
            createCreateMetadataAccountV3Instruction(
                {
                    metadata: metadataPDA,
                    mint: mintKeypair.publicKey,
                    mintAuthority: mintAuthority,
                    payer: payer.publicKey,
                    updateAuthority: mintAuthority
                },
                {
                    createMetadataAccountArgsV3: {
                        data: ON_CHAIN_METADATA,
                        isMutable: true,
                        collectionDetails: null
                    }
                }
            )
        )

        return createNewTokenTransaction
    }

    const main = async () => {
        try {
            console.log(`---STEP 1: Uploading MetaData---`)
            const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey)) //Keypair.fromSecretKey(new Uint8Array(secret));
            console.log("Userwallet", userWallet)
            let metadataUri = await uploadMetadata(MY_TOKEN_METADATA)
            console.log("metadataUri", metadataUri)

            ON_CHAIN_METADATA.uri = metadataUri

            console.log(`---STEP 2: Creating Mint Transaction---`)
            let mintKeypair = Keypair.generate()
            console.log(`New Mint Address: `, mintKeypair.publicKey.toString())

            const newMintTransaction = await createNewMintTransaction(
                solanaConnection,
                userWallet,
                mintKeypair,
                userWallet.publicKey,
                userWallet.publicKey,
                userWallet.publicKey
            )

            console.log(`---STEP 3: Executing Mint Transaction---`)
            let {
                lastValidBlockHeight,
                blockhash
            } = await solanaConnection.getLatestBlockhash("finalized")
            newMintTransaction.recentBlockhash = blockhash
            newMintTransaction.lastValidBlockHeight = lastValidBlockHeight
            newMintTransaction.feePayer = userWallet.publicKey
            const transactionId = await sendAndConfirmTransaction(
                solanaConnection,
                newMintTransaction,
                [userWallet, mintKeypair]
            )
            console.log(`Transaction ID: `, transactionId)
            console.log(
                `Succesfully minted ${MINT_CONFIG.numberTokens} ${
                    ON_CHAIN_METADATA.symbol
                } to ${userWallet.publicKey.toString()}.`
            )
            console.log(
                `View Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`
            )
            console.log(
                `View Token Mint: https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`
            )
        } catch (e) {
            console.log("Error", e)
        }

    }

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
            amountToBurn * (10**numDecimals), // Number of tokens to burn
            numDecimals // Number of Decimals of the Token Mint
        );
        console.log(`    ✅ - Burn Instruction Created`);

        // Step 3 - Fetch Blockhash
        console.log(`Step 3 - Fetch Blockhash`);
        const { blockhash, lastValidBlockHeight } = await solanaConnection.getLatestBlockhash('finalized');
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
        if (confirmation.value.err) { throw new Error("❌ - Transaction not confirmed.") }
        console.log('🔥 SUCCESSFUL BURN!🔥', '\n', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    }


    ///
  return (
    <div className="App">
      <h1>Demo Token Creation</h1>

      <div>
          <div>Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)}/>
      </div>
        <div>
            <div>Code</div>
            <input value={code} onChange={(e) => setCode(e.target.value)}/>
        </div>
        <div>
            <button onClick={async () => await main()}>Create</button>
        </div>
    </div>
  );
}

export default App;
