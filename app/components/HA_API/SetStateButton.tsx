// src/SetStateButton.js
import React from 'react';
import { setState } from './api';

const SetStateButton = ({ entityId, newState }) => {
    const handleSetState = async () => {
        await setState(entityId, newState);
    };

    return (
        <button onClick={handleSetState}
        className="w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >Set State</button>
    );
};

export default SetStateButton;
