// src/FetchStateButton.js
import React from 'react';
import { getService } from './api';

const FetchStateButton = () => {
    const handleFetchState = async () => {
        await getService();
    };

    return (
        <button onClick={handleFetchState}>Get Service</button>
    );
};

export default FetchStateButton;
