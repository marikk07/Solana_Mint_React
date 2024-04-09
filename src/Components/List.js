import React, { useState, useEffect } from 'react';
import axios from 'axios';

function List() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to fetch token details
    const fetchTokens = () => {
        // Replace 'http://localhost:3000' with the actual base URL of your API
        const apiUrl = `http://localhost:3000/api/tokenDetails`;
        setLoading(true); // Show loading indicator
        setError(''); // Reset previous errors

        axios.get(apiUrl)
            .then((response) => {
                setTokens(response.data); // Set the token details in state
                setLoading(false); // Hide loading indicator
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch token data.'); // Set error message
                setLoading(false); // Hide loading indicator
            });
    };

    // Function to refresh token details
    const refreshTokens = () => {
        const refreshUrl = `http://localhost:3000/api/refreshTokens`;

        axios.get(refreshUrl)
            .then(() => {
                fetchTokens(); // Re-fetch tokens after refreshing
            })
            .catch((error) => {
                console.error('Error refreshing tokens:', error);
                setError('Failed to refresh token data.'); // Set error message
                // Not setting loading to false here to avoid flicker in case of error
            });
    };

    // useEffect hook to fetch tokens when component mounts
    useEffect(() => {
        fetchTokens();
    }, []);

    // Conditional rendering based on loading state and error state
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Main component render
    return (
        <div>
            <h2>Token List</h2>
            <button onClick={refreshTokens}>Refresh Tokens</button> {/* Refresh button */}
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
                            {token.logo && (
                                <img src={token.logo} alt={`${token.name} icon`} style={{ width: '20px', height: '20px' }} />
                            )}
                        </td>
                        <td>{token.name}</td>
                        <td>{token.balance}</td> {/* Adjusted from amount to balance based on previous examples */}
                        <td>{token.mint}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default List;
