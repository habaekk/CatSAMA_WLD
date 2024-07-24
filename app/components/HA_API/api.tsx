import axios from 'axios';

const BASE_URL = process.env.LOCAL_HOST_HA;
const TOKEN = process.env.LONG_LIVE_THE_TOKEN;

const getHeaders = () => ({
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
});

const getState = async (entityId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/states/${entityId}`, {
            headers: getHeaders(),
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching state:', error);
    }
};

const setState = async (entityId: string, state: string) => {
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

const callService = async (domain: string, service: string, serviceData: object) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/services/${domain}/${service}`, serviceData, {
            headers: getHeaders(),
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error calling service:', error);
    }
};

// 예제 사용법
// (async () => {
//     const entityId = 'light.study_light';
//     await getState(entityId);
//     await setState(entityId, 'on');
//     await callService('light', 'turn_on', { entity_id: entityId });
// })();
