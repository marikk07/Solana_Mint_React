import {
    createBurnCheckedInstruction,
    createMintToCheckedInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token";
import {clusterApiUrl, Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction} from "@solana/web3.js";
import React, {useEffect, useState} from "react";
import bs58 from "bs58";
import {userWallet, solanaConnection} from "../Constants";
import axios from "axios";

function MintBurn() {
    const [tokens, setTokens] = useState([]);
    const [numDecimals, setDecimals] = useState(9);
    const [amount, setAmount] = useState("");
    const [tokenMint, setTokenMint] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showDelegates, setShowDelegates] = useState(false);
    const [delegates, setDelegates] = useState([]);


    const mintApiUrl = 'http://localhost:3000/api/mint';
    const burnApiUrl = 'http://localhost:3000/api/burn';
    const apiUrl = `http://localhost:3000/api/tokenDetails`;
    const fetchDelegatesApiUrl = 'http://localhost:3000/api/delegates';

    useEffect(() => {
        fetchDelegates();
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setTokens(data);
                if (data.length > 0) {
                    setTokenMint(data[0].tokenMint); // Automatically select the first token mint address
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch token data.');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    const toggleDelegatesVisibility = () => {
        setShowDelegates(!showDelegates);
    };

    async function fetchDelegates() {
        setIsLoading(true);
        try {
            const response = await axios.get(fetchDelegatesApiUrl);
            setDelegates(response.data.delegates); // You need to add a useState for delegates
        } catch (error) {
            console.error('Error fetching delegates:', error);
            setFeedback(`Error fetching delegates: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsLoading(false);
        }
    }



    async function burnTokens(
        wallet,
        tokenMint, // The mint associated with the token
        amountToBurn // The number of tokens to burn
    ) {
        console.log(`Attempting to burn ${amountToBurn} [${tokenMint}] tokens from Owner Wallet: ${wallet.publicKey.toString()}`);
        const data = {
            tokenMint: tokenMint,
            amountToBurn: amountToBurn
        };

        const options = {
            method: 'POST',
            url: burnApiUrl,
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
                const message = `${response.data.message}`;
                setFeedback(message);
            })
            .catch(function (error) {
                console.error(error);
                setFeedback(`Error: ${error.response?.data?.error || error.message}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    async function mintToken(
        wallet,
        tokenMint, // The mint associated with the token
        amountToBurn // The number of tokens to burn
    ) {
        console.log(`Attempting to minToken ${amountToBurn} [${tokenMint}] tokens from Owner Wallet: ${wallet.publicKey.toString()}`);

        const data = {
            tokenMint: tokenMint,
            amountToBurn: amountToBurn
        };

        const options = {
            method: 'POST',
            url: mintApiUrl,
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
                const message = ` ${response.data.message}`;
                setFeedback(message);
            })
            .catch(function (error) {
                console.error(error);
                setFeedback(`Error: ${error.response?.data?.error || error.message}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <div>
            <h2>Mint & Burn 🔥🔥🔥</h2>
            <button onClick={toggleDelegatesVisibility}>
                {showDelegates ? 'Use Main Key' : 'Use Delegate Key'}
            </button>

            {showDelegates && (
                <div>
                    <label htmlFor="delegateSelect">Select Delegate:</label>
                    <select id="delegateSelect" onChange={(e) => setDelegates(e.target.value)}>
                        {delegates.map((delegate) => (
                            <option key={delegate.id} value={delegate.public_key}>
                                {delegate.public_key}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label htmlFor="tokenSelect">Select Token:</label>
                <select
                    id="tokenSelect"
                    onChange={(e) => setTokenMint(e.target.value)}
                >
                    {tokens.map((token) => (
                        <option key={token.mint} value={token.mint}>
                            {token.symbol}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="Token Mint">Token Mint Address:</label>
                <input
                    id="Token Mint"
                    value={tokenMint}
                    onChange={(e) => setTokenMint(e.target.value)}
                />
            </div>
            <div className="input-group" style={{textAlign: 'right'}}>
                <label htmlFor="amount">Enter Amount:</label>
                <input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <div style={{height: '10px'}}></div>
            </div>
            <button
                onClick={async () => await burnTokens(userWallet, tokenMint, amount)}
                style={{marginRight: '10px'}}
            >
                Burn
            </button>
            {/* Conditionally render the Mint button */}
            {!showDelegates && (
                <button onClick={async () => await mintToken(userWallet, tokenMint, amount)}>
                    Mint
                </button>
            )}

            <div className={feedback.startsWith("Error") ? "error-feedback" : "success-feedback"}>
                {feedback}
            </div>
        </div>
    );
}

export default MintBurn;
