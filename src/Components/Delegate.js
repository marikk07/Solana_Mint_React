import React, {useEffect, useState} from 'react';
import axios from "axios";
import { BASE_URL } from '../Constants';

function Delegate() {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [tokenMint, setTokenMint] = useState("");
    const [delegateAddress, setDelegateAddress] = useState("");
    const [amount, setAmount] = useState(0);

    const apiUrl = `${BASE_URL}/api/tokenDetails`;
    const delegateApiUrl = `${BASE_URL}/api/addDelegate`;

    useEffect(() => {
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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        addDelegate()
    };

    async function addDelegate() {
        console.log(`Lets try to add delegate`);
        console.log(`Token mint: `, tokenMint);
        const data = {
            tokenMintAddress: tokenMint,
            // tokenAccountPubkey: tokenAccountPubkey,
            delegatePubKey: delegateAddress,
            amount: amount
            // decimal: decimal
        };

        const options = {
            method: 'POST',
            url: delegateApiUrl,
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
        <div style={{ padding: '20px' }}>
            <h2>Delegate Page</h2>
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
            <form onSubmit={handleSubmit}>
                <label>
                    Delegate Address:
                    <input type="text" value={delegateAddress} onChange={e => setDelegateAddress(e.target.value)} />
                </label>
                <br />
                <label>
                    Amount:
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                </label>
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Delegate;
