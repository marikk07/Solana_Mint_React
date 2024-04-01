// function Freeze() {
//     return <div><h2>Freeze Page</h2></div>;
// }
//
// export default Freeze;

import React, { useState } from 'react';
import axios from "axios";

function Freeze() {
    const freezeApiUrl = 'http://localhost:3000/api/freeze';
    const unfreezeApiUrl = 'http://localhost:3000/api/unfreeze';

    const [tokenMintAddress, setTokenMintAddress] = useState('');
    const [account, setAccount] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isFreezing, setIsFreezing] = useState(true); // true for freezing, false for unfreezing


    async function freezeToken() {
        console.log(`Lets try to freeze token`);
        const data = {
            tokenMintAddress: tokenMintAddress,
            account: account
        };

        const options = {
            method: 'POST',
            url: freezeApiUrl,
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

    async function unfreezeToken() {
        console.log(`Lets try to unfreeze token`);
        const data = {
            tokenMintAddress: tokenMintAddress,
            account: account
        };

        const options = {
            method: 'POST',
            url: unfreezeApiUrl,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('Processing...');

        try {
            let result;
            if (isFreezing) {
                // Assuming freezeToken is the function to freeze the account
                result = await freezeToken(tokenMintAddress, account);
            } else {
                // Assuming unfreezeToken is the function to unfreeze the account
                result = await unfreezeToken(tokenMintAddress, account);
            }
            setStatusMessage(`${isFreezing ? 'Freezed' : 'Unfreezed'} successfully!`);
        } catch (error) {
            console.error(`Error ${isFreezing ? 'freezing' : 'unfreezing'} account:`, error);
            setStatusMessage(`Failed to ${isFreezing ? 'freeze' : 'unfreeze'}. Please try again.`);
        }
    };

    return (
        <div>
            <h2>{isFreezing ? 'Freeze' : 'Unfreeze'} Page</h2>
            <button onClick={() => setIsFreezing(!isFreezing)}>
                Switch to {isFreezing ? 'Unfreeze' : 'Freeze'}
            </button>
            <form onSubmit={handleSubmit}>
                <label>
                    Token Mint Address:
                    <input
                        type="text"
                        value={tokenMintAddress}
                        onChange={(e) => setTokenMintAddress(e.target.value)}
                    />
                </label>
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
