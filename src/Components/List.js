import React, { useState, useEffect } from 'react';
import {solanaConnection, userWallet} from "../Constants";
import {
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import axios from "axios";

function List() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Replace 'http://localhost:3000' with the actual base URL of your API
        const apiUrl = `http://localhost:3000/api/tokenDetails`;

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setTokens(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch token data.');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Token List</h2>
            <table>
                <thead>
                <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th>Mint Address</th>
                </tr>
                </thead>
                <tbody>
                {tokens.map((token, index) => (
                    <tr key={index}>
                        <td>
                            {token.tokenLogo && (
                                <img src={token.tokenLogo} alt={`${token.name} icon`} style={{ width: '20px', height: '20px' }} />
                            )}
                        </td>
                        <td>{token.name}</td>
                        <td>{token.balance}</td>
                        <td>{token.mint}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}



export default List;