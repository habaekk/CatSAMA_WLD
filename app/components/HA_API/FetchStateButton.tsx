// src/FetchStateButton.js
import React from 'react';
import { getState } from './api';

const FetchStateButton = ({ entityId }) => {
    const handleFetchState = async () => {
        await getState(entityId);
    };

    return (
        <button onClick={handleFetchState}>Fetch State</button>
    );
};

export default FetchStateButton;
