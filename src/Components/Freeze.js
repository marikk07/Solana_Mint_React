import React, { useEffect, useState } from 'react';
import axios from "axios";
import { BASE_URL } from '../Constants';

function Freeze() {
    const [tokens, setTokens] = useState([]);
    const [tokenMintAddress, setTokenMintAddress] = useState('');
    const [account, setAccount] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isFreezing, setIsFreezing] = useState(true); // true for freezing, false for unfreezing
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const freezeApiUrl = `${BASE_URL}/api/freeze`;
    const unfreezeApiUrl = `${BASE_URL}/api/unfreeze`;
    const tokenDetailsApiUrl = `${BASE_URL}/api/tokenDetails`;

    const commonHeaders = {
        'content-type': 'application/json',
        'X-RapidAPI-Key': 'your-rapidapi-key', // Update this according to your actual API requirements
        'X-RapidAPI-Host': 'your-rapidapi-host', // Update this according to your actual API requirements
    };

    useEffect(() => {
        fetch(tokenDetailsApiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setTokens(data);
                if (data.length > 0) {
                    setTokenMintAddress(data[0].mint); // Automatically select the first token mint address
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching token data:', error);
                setError('Failed to fetch token data.');
                setIsLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('Processing...');
        setIsLoading(true);

        try {
            if (isFreezing) {
                await freezeToken();
                setStatusMessage('Frozen successfully!');
            } else {
                await unfreezeToken();
                setStatusMessage('Unfrozen successfully!');
            }
        } catch (error) {
            console.error(`Error ${isFreezing ? 'freezing' : 'unfreezing'} account:`, error);
            setStatusMessage(`Failed to ${isFreezing ? 'freeze' : 'unfreeze'}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    async function freezeToken() {
        const data = {
            tokenMintAddress: tokenMintAddress,
            account: account
        };

        try {
            const response = await axios.post(freezeApiUrl, data, { headers: commonHeaders });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function unfreezeToken() {
        const data = {
            tokenMintAddress: tokenMintAddress,
            account: account
        };

        try {
            const response = await axios.post(unfreezeApiUrl, data, { headers: commonHeaders });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
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
            <h2>{isFreezing ? 'Freeze' : 'Unfreeze'} Page</h2>
            <button onClick={() => setIsFreezing(!isFreezing)}>
                Switch to {isFreezing ? 'Unfreeze' : 'Freeze'}
            </button>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="tokenSelect">Select Token:</label>
                    <select
                        id="tokenSelect"
                        onChange={(e) => setTokenMintAddress(e.target.value)}
                        value={tokenMintAddress}
                    >
                        {tokens.map((token) => (
                            <option key={token.mint} value={token.mint}>
                                {token.symbol}
                            </option>
                        ))}
                    </select>
                </div>
                <label>
                    Account to {isFreezing ? 'Freeze' : 'Unfreeze'}:
                    <input
                        type="text"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                    />
                </label>
                <button type="submit">{isFreezing ? 'Freeze' : 'Unfreeze'} Account</button>
            </form>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
}

export default Freeze;
