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
        return response.data; // 데이터를 리턴하도록 수정
    } catch (error) {
        throw error; // 에러도 리턴하여 호출부에서 처리할 수 있도록 설정
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
        return response.data; // 데이터를 리턴하도록 설정 (필요 시)
    } catch (error) {
        console.error('Error setting state:', error);
        throw error; // 에러도 리턴
    }
};

export const getService = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/services`, {
            headers: getHeaders(),
        });
        return response.data; // 데이터를 리턴하도록 수정
    } catch (error) {
        console.error('Error getting service:', error);
        throw error; // 에러도 리턴하여 호출부에서 처리할 수 있도록 설정
    }
};

export const callService = async (domain, service, serviceData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/services/${domain}/${service}`, serviceData, {
            headers: getHeaders(),
        });
        console.log(response.data);
        return response.data; // 데이터를 리턴하도록 설정 (필요 시)
    } catch (error) {
        console.error('Error calling service:', error);
        throw error; // 에러도 리턴
    }
};
