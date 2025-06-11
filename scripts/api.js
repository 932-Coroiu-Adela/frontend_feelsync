import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';

const api = axios.create({
    baseURL: 'feel-sync-backend-app-eyfxgjdsd4f8echf.westeurope-01.azurewebsites.net',
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