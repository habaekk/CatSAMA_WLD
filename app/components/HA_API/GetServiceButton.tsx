// src/FetchStateButton.js
import React from 'react';
import { getService } from './api';

const FetchStateButton = () => {
    const handleFetchState = async () => {
        await getService();
    };

    return (
        <button onClick={handleFetchState}
        className="w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >Get Service</button>
    );
};

export default FetchStateButton;
