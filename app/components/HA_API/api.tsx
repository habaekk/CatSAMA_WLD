// src/api.js
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_LOCAL_HOST_HA;
const TOKEN = process.env.NEXT_PUBLIC_LONG_LIVE_THE_TOKEN;

const getHeaders = () => ({
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
});

export const getState = async (entityId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/states/${entityId}`, {
            headers: getHeaders(),
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching state:', error);
    }
};

export const setState = async (entityId, state) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/states/${entityId}`, {
            state: state
        }, {
            headers: getHeaders(),
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error setting state:', error);
    }
};

export const callService = async (domain, service, serviceData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/services/${domain}/${service}`, serviceData, {
            headers: getHeaders(),
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error calling service:', error);
    }
};
