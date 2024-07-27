// src/CallServiceButton.js
import React from 'react';
import { callService } from './api';

const CallServiceButton = ({ domain, service, serviceData }) => {
    const handleCallService = async () => {
        await callService(domain, service, serviceData);
    };

    return (
        <button onClick={handleCallService}>Call Service</button>
    );
};

export default CallServiceButton;
