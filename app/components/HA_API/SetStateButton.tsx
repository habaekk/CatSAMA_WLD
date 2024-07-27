// src/SetStateButton.js
import React from 'react';
import { setState } from './HA_API/api';

const SetStateButton = ({ entityId, newState }) => {
    const handleSetState = async () => {
        await setState(entityId, newState);
    };

    return (
        <button onClick={handleSetState}>Set State</button>
    );
};

export default SetStateButton;
