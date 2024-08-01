// import logo from './logo.svg';
// import './App.css';
import  './Components.css'
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../Constants';

import axios from "axios";

    function CreateToken() {
        const [feedback, setFeedback] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const [name, setName] = useState("");
        const [symbol, setSymbol] = useState("");
        const [description, setDescription] = useState("");
        const [image, setImage] = useState("");
        const [numDecimals, setDecimals] = useState(9);
        const [tokensAmount, setTokensAmount] = useState(1000);

        const [amount, setAmount] = useState("");
        const [tokenMint, setTokenMint] = useState("");
        const [publicKey, setPublicKey] = useState("");
        const createTokenApiUrl = `${BASE_URL}/api/createToken`;
        const fetchTokenApiUrl = `${BASE_URL}/api/publicKey`;

        useEffect(() => {
            fetchPublicKey();
        }, []);

        async function fetchPublicKey() {
            try {
                const response = await axios.get(fetchTokenApiUrl);
                if (response.data.success) {
                    setPublicKey(response.data.key);
                } else {
                    setFeedback("Failed to fetch public key.");
                }
            } catch (error) {
                console.error('Error fetching public key:', error);
                setFeedback(`Error fetching public key: ${error.message}`);
            }
        }

        async function createToken() {
            if (!name || !symbol || !description || !image) {
                setFeedback("Please fill out all fields.");
                console.log("Please fill out all fields.");
                return;
            }

            console.log(`Lets try to create token`);
            setIsLoading(true); // Start loading
            const data = {
                tokenName: name,
                tokenSymbol: symbol,
                description: description,
                imageUrl: image,
                decimals: numDecimals,
                numberOfTokens: tokensAmount
            };

            const options = {
                method: 'POST',
                url: createTokenApiUrl,
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
                    const message = `Token created successfully! : ${response.data.result}`;
                    setFeedback(message);
                })
                .catch(function (error) {
                    console.error(error);
                    setFeedback(`Error creating the token: ${error.response?.data?.error || error.message}`);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

        return (
            <div className="App">
                <div className="App">
                    <div className="header">
                        <h1>Token Creation</h1>
                    </div>
                    <div className="public-key-label">
                        {publicKey && <span>Public Key: {publicKey}</span>}
                    </div>
                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '20px'}}>
                            <div>
                                <h2>Token Creation 🚀🚀🚀</h2>
                                <div className="input-group" style={{textAlign: 'right'}}>
                                    <label htmlFor="name">Enter Name:</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)}/>
                                </div>
                                <div className="input-group" style={{textAlign: 'right'}}>
                                    <label htmlFor="symbol">Enter Symbol:</label>
                                    <input value={symbol} onChange={(e) => setSymbol(e.target.value)}/>
                                </div>

                                <div className="input-group" style={{textAlign: 'right'}}>
                                    <label htmlFor="description">Enter Description:</label>
                                    <input value={description} onChange={(e) => setDescription(e.target.value)}/>
                                </div>

                                <div className="input-group" style={{textAlign: 'right'}}>
                                    <label htmlFor="image">Enter Image Url:</label>
                                    <input value={image} onChange={(e) => setImage(e.target.value)}/>
                                </div>

                                <div className="input-group" style={{textAlign: 'right'}}>
                                    <label htmlFor="numDecimals">Set Decimals:</label>
                                    <input value={numDecimals} onChange={(e) => setDecimals(e.target.value)}/>
                                </div>

                                <div className="input-group" style={{textAlign: 'right'}}>
                                    <label htmlFor="numDecimals">Set Tokens Amount:</label>
                                    <input value={tokensAmount} onChange={(e) => setTokensAmount(e.target.value)}/>
                                    <div style={{height: '10px'}}></div>
                                </div>


                                {/*<button onClick={async () => await createToken()}>Create Token</button>*/}
                                {isLoading ? (
                                    <div>Loading...</div> // You can replace this with a spinner or any custom loading indicator
                                ) : (
                                    <div>
                                        {/* Your form and feedback message here */}

                                        <button onClick={createToken} disabled={isLoading}>Create Token</button>
                                    </div>
                                )}

                                {/* Feedback message, displayed whether loading or not */}
                                <div className={feedback.startsWith("Error") ? "error-feedback" : "success-feedback"}>
                                    {feedback}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

export default CreateToken;
