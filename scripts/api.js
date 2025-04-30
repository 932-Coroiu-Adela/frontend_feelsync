import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';

const api = axios.create({
    baseURL: 'http://172.30.250.209:5056',
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 401) {
            await AsyncStorage.removeItem('sessionToken');
            await AsyncStorage.removeItem('expiresAt');

            router.replace('/login');
        }
        return Promise.reject(error);
    }
);

export default api;