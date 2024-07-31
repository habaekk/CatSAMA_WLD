// src/CallServiceButton.js
import React from 'react';
import { callService } from './api';

const CallServiceButton = ({ domain, service, serviceData }) => {
    const handleCallService = async () => {
        await callService(domain, service, serviceData);
    };

    return (
        <button onClick={handleCallService}
        className="w-full max-w-md bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >Call Service</button>
    );
};

export default CallServiceButton;
