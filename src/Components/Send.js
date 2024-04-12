import React, { useEffect, useState } from 'react';
import axios from "axios";
import { BASE_URL } from '../Constants';
const Send = () => {
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [tokens, setTokens] = useState([]);
    const [selectedTokenMint, setSelectedTokenMint] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const sendApiUrl = `${BASE_URL}/api/sendTokens`;
    const apiUrl = `${BASE_URL}/api/tokenDetails`;

    useEffect(() => {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setTokens(data);
                if (data.length > 0) {
                    setSelectedTokenMint(data[0].mint); // Automatically select the first token's mint address
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching token data:', error);
                setError('Failed to fetch token data.');
                setIsLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Sending ${amount} of selected token (${selectedTokenMint}) to ${recipientAddress}`);

        const data = {
            recipientAddress: recipientAddress,
            amount: amount,
            tokenMint: selectedTokenMint,
        };

        const options = {
            method: 'POST',
            url: sendApiUrl,
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
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Send Solata Tokens</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="tokenSelect">Select Token:</label>
                    <select
                        id="tokenSelect"
                        value={selectedTokenMint}
                        onChange={(e) => setSelectedTokenMint(e.target.value)}
                    >
                        {tokens.map((token) => (
                            <option key={token.mint} value={token.mint}>
                                {token.symbol}
                            </option>
                        ))}
                    </select>
                </div>
                <label>
                    Recipient Address:
                    <input type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                </label>
                <br />
                <label>
                    Amount:
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </label>
                <br />
                <button type="submit">Send Tokens</button>
            </form>
        </div>
    );
};

export default Send;
