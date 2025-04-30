import { io } from 'socket.io-client';

const socket = io('http://192.168.1.159:5056', {
    transports: ['websocket'],
    autoConnect: false,
});

export default socket;