// src/FetchStateButton.js
import React from 'react';
import { getState } from './api';

const FetchStateButton = ({ entityId }) => {
    const handleFetchState = async () => {
        await getState(entityId);
    };

    return (
        <button onClick={handleFetchState}
        className='w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300'
        >Fetch State</button>
    );
};

export default FetchStateButton;
