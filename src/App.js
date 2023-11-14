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
const apiUrl = 'http://localhost:3000/api/createToken';
//'https://solana-backend-844f8683e25f.herokuapp.com/api/createToken';

function App() {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [numDecimals, setDecimals] = useState(9);
    const [tokensAmount, setTokensAmount] = useState(1000);



    const [amount, setAmount] = useState("");
    const [tokenMint, setTokenMint] = useState("");
    // const [usersPrivateKey, setUsersPrivateKey] = useState("");

    const endpoint =
        "https://aged-few-gas.solana-devnet.quiknode.pro/709859f8e8b4d80991023ddd417b320d0e139e84/" //Replace with your RPC Endpoint
    const solanaConnection = new Connection(clusterApiUrl("devnet")) //new Connection(endpoint);

    const secretKey =
        "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"


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

    async function createToken() {
        console.log(`Lets try to create token`);
        const data = {
            tokenName: name,
            tokenSymbol: symbol,
            description: description,
            imageUrl: image,
            decimals: numDecimals,
            numberOfTokens: tokensAmount
        };

        console.log(`Token Name: ${data.tokenName}`);

        // try {
        //     const response = await axios.post(apiUrl, data);
        //     console.log('Token creation successful:', response.data);
        // } catch (error) {
        //     console.error('Error creating the token:', error);
        // }

        const options = {
            method: 'POST',
            url: apiUrl,
            params: { 'api-version': '3.0' },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': 'your-rapidapi-key',
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
            },
            data: data
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.error(error);
            });
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
                            </div>

                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="numDecimals">Set Decimals:</label>
                                <input value={numDecimals} onChange={(e) => setDecimals(e.target.value)}/>
                            </div>

                            <div className="input-group" style={{ textAlign: 'right' }}>
                                <label htmlFor="numDecimals">Set Tokens Amount:</label>
                                <input value={tokensAmount} onChange={(e) => setTokensAmount(e.target.value)}/>
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
