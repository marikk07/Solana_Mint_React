import React, {useEffect, useState} from 'react';

function Delegate() {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [tokenMint, setTokenMint] = useState("");

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
                // if (data.length > 0) {
                //     setTokenMint(data[0].tokenMint); // Automatically select the first token mint address
                // }
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
        // Implement your submission logic here
        console.log('Form submitted');
    };

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
                            {token.tokenSymbol}
                        </option>
                    ))}
                </select>
            </div>
            <form onSubmit={handleSubmit}>
                <label>
                    Delegate Address:
                    <input type="text" name="delegateAddress" />
                </label>
                <br />
                <label>
                    Amount:
                    <input type="number" name="amount" />
                </label>
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Delegate;
