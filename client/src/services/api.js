import axios from axios

const API_URL = 'http://127.0.0.1:5000/api';

//create axios instance with base url
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const registerUser = async (uerData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data: new Error('Registration failed');
    }
};
