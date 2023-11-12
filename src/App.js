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
    createBurnCheckedInstruction,
    createMintToCheckedInstruction
} from "@solana/spl-token"
import {createCreateMetadataAccountV3Instruction} from "@metaplex-foundation/mpl-token-metadata"
import {
    bundlrStorage,
    keypairIdentity,
    Metaplex
} from "@metaplex-foundation/js"
import bs58 from "bs58"

const axios = require('axios');
const apiUrl = 'http://localhost:3000/api/example';

function App() {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");

    const [amount, setAmount] = useState("");
    const [tokenMint, setTokenMint] = useState("");
    // const [usersPrivateKey, setUsersPrivateKey] = useState("");

    const endpoint =
        "https://aged-few-gas.solana-devnet.quiknode.pro/709859f8e8b4d80991023ddd417b320d0e139e84/" //Replace with your RPC Endpoint
    const solanaConnection = new Connection(clusterApiUrl("devnet")) //new Connection(endpoint);

    const secretKey =
        "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"

    const numDecimals = 6

    const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey))
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
        name: "My New Token",
        symbol: "MkkT",
        description: "This is my first token!",
        image:
            "https://images.ctfassets.net/q5ulk4bp65r7/45uk7WZNNBGCHOwlNaGCT4/a4c8897e2cae08e4f42bf56ca6e3ba4b/solona.png" //add public URL to image you'd like to use
    }
    const ON_CHAIN_METADATA = {
        name: "My New Token",
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
    // const uploadMetadata = async tokenMetadata => {
    //         //Upload to Arweave
    //         console.log(`metaplex`, metaplex);
    //         console.log(`tokenMetadata`, tokenMetadata);
    //         metaplex.nfts().uploadMetadata(tokenMetadata).then((res) => {
    //             console.log(`Arweave URL: `, res.uri)
    //             return res.uri
    //         })
    //     }

    // async function createNewMintTransaction(connection, payer, mintKeypair,
    //                                         destinationWallet, mintAuthority, freezeAuthority) {
    //     //Get the minimum lamport balance to create a new account and avoid rent payments
    //     console.log(`---STEP 2.1: Get the minimum lamport balance to create a new account and avoid rent payments---`)
    //     const requiredBalance = await getMinimumBalanceForRentExemptMint(connection)
    //     //metadata account associated with mint
    //     const metadataPDA = await metaplex
    //         .nfts()
    //         .pdas()
    //         .metadata({mint: mintKeypair.publicKey})
    //     //get associated token account of your wallet
    //     const tokenATA = await getAssociatedTokenAddress(
    //         mintKeypair.publicKey,
    //         destinationWallet
    //     )
    //     console.log(`---STEP 2.2: createNewTokenTransaction---`)
    //     console.log(`metadataPDA: `, metadataPDA)
    //     console.log(`mintKeypair.publicKey: `, mintKeypair.publicKey)
    //     console.log(`mintAuthority: `, mintAuthority)
    //     console.log(`ON_CHAIN_METADATA: `, ON_CHAIN_METADATA)
    //
    //
    //     const createNewTokenTransaction = new Transaction().add(
    //         SystemProgram.createAccount({
    //             fromPubkey: payer.publicKey,
    //             newAccountPubkey: mintKeypair.publicKey,
    //             space: MINT_SIZE,
    //             lamports: requiredBalance,
    //             programId: TOKEN_PROGRAM_ID
    //         }),
    //         createInitializeMintInstruction(
    //             //Mint Address
    //             mintKeypair.publicKey, //Number of Decimals of New mint
    //             MINT_CONFIG.numDecimals, //Mint Authority
    //             mintAuthority, //Freeze Authority
    //             freezeAuthority,
    //             TOKEN_PROGRAM_ID
    //         ),
    //         createAssociatedTokenAccountInstruction(
    //             //Payer
    //             payer.publicKey, //Associated token account
    //             tokenATA, //token owner
    //             payer.publicKey, //Mint
    //             mintKeypair.publicKey
    //         ),
    //         // createMintToInstruction(
    //         //     //Mint
    //         //     mintKeypair.publicKey, //Destination Token Account
    //         //     tokenATA, //Authority
    //         //     mintAuthority, //number of tokens
    //         //     MINT_CONFIG.numberTokens * Math.pow(10, MINT_CONFIG.numDecimals)
    //         // ),
    //         // createCreateMetadataAccountV3Instruction(
    //         //     {
    //         //         metadata: metadataPDA,
    //         //         mint: mintKeypair.publicKey,
    //         //         mintAuthority: mintAuthority,
    //         //         payer: payer.publicKey,
    //         //         updateAuthority: mintAuthority
    //         //     },
    //         //     {
    //         //         createMetadataAccountArgsV3: {
    //         //             data: ON_CHAIN_METADATA,
    //         //             isMutable: true,
    //         //             collectionDetails: null
    //         //         }
    //         //     }
    //         // )
    //     )
    //
    //     console.log(`---STEP 2.6: Final return---`)
    //     return createNewTokenTransaction
    // }

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
            new PublicKey("3fj5pqcPKWYLzJsqB2STbyxvGM8hr98AFtpjGA5uwpX6"),
            new PublicKey("GcbygsphsrzZZ7v3RvAmR6w7BZERHNi5ghGxcrNjmVj4"),
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

    // async function createToken() {
    //     console.log(`---STEP 1: Uploading MetaData---`)
    //     const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey))
    //     let metadataUri = await uploadMetadata(MY_TOKEN_METADATA)
    //     ON_CHAIN_METADATA.uri = metadataUri
    //
    //     console.log(`---STEP 2: Creating Mint Transaction---`)
    //     let mintKeypair = Keypair.generate()
    //     console.log(`New Mint Address: `, mintKeypair.publicKey.toString())
    //
    //     const newMintTransaction = await createNewMintTransaction(
    //         solanaConnection,
    //         userWallet,
    //         mintKeypair,
    //         userWallet.publicKey,
    //         userWallet.publicKey,
    //         userWallet.publicKey
    //     )
    //
    //     console.log(solanaConnection.description)
    //
    //     console.log(`---STEP 3: Executing Mint Transaction---`)
    //     let {
    //         lastValidBlockHeight,
    //         blockhash
    //     } = await solanaConnection.getLatestBlockhash("finalized")
    //     newMintTransaction.recentBlockhash = blockhash
    //     newMintTransaction.lastValidBlockHeight = lastValidBlockHeight
    //     newMintTransaction.feePayer = userWallet.publicKey
    //     const transactionId = await sendAndConfirmTransaction(
    //         solanaConnection,
    //         newMintTransaction,
    //         [userWallet, mintKeypair]
    //     )
    //     console.log(`Transaction ID: `, transactionId)
    //     console.log(
    //         `Succesfully minted ${MINT_CONFIG.numberTokens} ${
    //             ON_CHAIN_METADATA.symbol
    //         } to ${userWallet.publicKey.toString()}.`
    //     )
    //     console.log(
    //         `View Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`
    //     )
    //     console.log(
    //         `View Token Mint: https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`
    //     )
    // }

    async function createToken() {
        const data = {
            tokenName: name,
            tokenSymbol: symbol,
            description: description,
            imageUrl: image
        };

        try {
            const response = await axios.post(apiUrl, data);
            console.log('Token creation successful:', response.data);
        } catch (error) {
            console.error('Error creating the token:', error);
        }
    }


    return (
        <div className="App">
            <div className="App">
                <h1>Demo Token Creation</h1>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
                        <div>
                            <h2>Token Creation 🚀🚀🚀</h2>
                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="name">Enter Name:</label>
                                <input value={name} onChange={(e) => setName(e.target.value)}/>
                            </div>
                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="symbol">Enter Symbol:</label>
                                <input value={symbol} onChange={(e) => setSymbol(e.target.value)}/>
                            </div>

                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="description">Enter Description:</label>
                                <input value={description} onChange={(e) => setDescription(e.target.value)}/>
                            </div>

                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="image">Enter Image Url:</label>
                                <input value={image} onChange={(e) => setImage(e.target.value)}/>
                                <div style={{height: '10px'}}></div>
                            </div>


                            <button onClick={async () => await createToken()}>Create Token</button>
                        </div>
                        <div>
                            <h2>Mint & Burn 🔥🔥🔥</h2>
                            <div>
                                <label htmlFor="Token Mint">Enter TokenMint:</label>
                                <input value={tokenMint} onChange={(e) => setTokenMint(e.target.value)}/>
                            </div>
                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="amount">Enter Amount:</label>
                                <input value={amount} onChange={(e) => setAmount(e.target.value)}/>
                                <div style={{height: '10px'}}></div>
                            </div>
                            <button onClick={async () => await burnTokens(userWallet, tokenMint, amount)}
                                    style={{ marginRight: '10px' }}>Burn
                            </button>
                            <button onClick={async () => await mintToken(userWallet, tokenMint, amount)}>Mint</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
