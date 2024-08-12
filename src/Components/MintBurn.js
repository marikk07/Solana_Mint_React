import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from '../Constants';

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
    const [selectedDelegate, setSelectedDelegate] = useState("");
    const [maxDelegatedAmount, setMaxDelegatedAmount] = useState(null);

    const mintApiUrl = `${BASE_URL}/api/mint`;
    const burnApiUrl = `${BASE_URL}/api/burn`;
    const apiUrl = `${BASE_URL}/api/tokenDetails`;
    const fetchDelegatesApiUrl = `${BASE_URL}/api/delegates`;
    const fetchDelegatedAmountApiUrl = `${BASE_URL}/api/delegatesTokenAmount`;

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
                setTokens(Array.isArray(data) ? data : []);
                if (data.length > 0) {
                    setTokenMint(data[0].mint); // Automatically select the first token mint address
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch token data.');
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (showDelegates && tokenMint) {
            fetchMaxDelegatedAmount();
        }
    }, [showDelegates, tokenMint]);


    async function fetchDelegates() {
        try {
            const response = await axios.get(fetchDelegatesApiUrl);
            setDelegates(Array.isArray(response.data.delegates) ? response.data.delegates : []);
        } catch (error) {
            console.error('Error fetching delegates:', error);
            setFeedback(`Error fetching delegates: ${error.response?.data?.error || error.message}`);
        }
    }

    async function fetchMaxDelegatedAmount() {
        try {
            const response = await axios.get(fetchDelegatedAmountApiUrl, {
                params: { tokenMint: tokenMint }
            });
            setMaxDelegatedAmount(response.data.amount);
        } catch (error) {
            console.error('Error fetching max delegated amount:', error);
            setFeedback(`Error fetching max delegated amount: ${error.response?.data?.error || error.message}`);
        }
    }

    const toggleDelegatesVisibility = () => {
        setShowDelegates(!showDelegates);
        setSelectedDelegate("");
        setMaxDelegatedAmount(null);
    };

    async function burnTokens(tokenMint, amountToBurn) {
        setIsLoading(true);
        console.log(`Attempting to burn ${amountToBurn} [${tokenMint}] tokens from Owner Wallet`);
        const data = {
            tokenMint: tokenMint,
            amountToBurn: amountToBurn,
            delegate: selectedDelegate
        };

        const options = {
            method: 'POST',
            url: burnApiUrl,
            headers: {
                'content-type': 'application/json'
            },
            data: data
        };

        try {
            const response = await axios.request(options);
            console.log(response.data);
            setFeedback(`${response.data.message}`);
        } catch (error) {
            console.error(error);
            setFeedback(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function mintToken(tokenMint, amount) {
        setIsLoading(true);
        console.log(`Attempting to mint ${amount} [${tokenMint}] tokens from Owner Wallet`);

        const data = {
            tokenMint: tokenMint,
            amount: amount,
            delegate: selectedDelegate
        };

        const options = {
            method: 'POST',
            url: mintApiUrl,
            headers: {
                'content-type': 'application/json'
            },
            data: data
        };

        try {
            const response = await axios.request(options);
            console.log(response.data);
            setFeedback(`${response.data.message}`);
        } catch (error) {
            console.error(error);
            setFeedback(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
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
                    <select id="delegateSelect" onChange={(e) => setSelectedDelegate(e.target.value)}>
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
                    value={tokenMint}
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
                <label htmlFor="TokenMint">Token Mint Address:</label>
                <input
                    id="TokenMint"
                    value={tokenMint}
                    onChange={(e) => setTokenMint(e.target.value)}
                    style={{ width: '80%' }}
                />
            </div>
            <div className="input-group" style={{ textAlign: 'left' }}>
                <label htmlFor="amount">Enter Amount:</label>
                <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <div style={{ height: '10px' }}></div>
            </div>
            <button
                onClick={async () => await burnTokens(tokenMint, amount)}
                style={{ marginRight: '10px' }}
            >
                Burn
            </button>
            {!showDelegates && (
                <button onClick={async () => await mintToken(tokenMint, amount)}>
                    Mint
                </button>
            )}

            {showDelegates && maxDelegatedAmount !== null && (
                <div>
                    <p>Max Delegated Amount: {maxDelegatedAmount}</p>
                </div>
            )}

            <div className={feedback.startsWith("Error") ? "error-feedback" : "success-feedback"}>
                {feedback}
            </div>
        </div>
    );
}

export default MintBurn;
