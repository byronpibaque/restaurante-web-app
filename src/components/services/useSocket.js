import { ref, onUnmounted } from 'vue';
import io from 'socket.io-client';

export default function useSocket(url) {
    const socket = ref(null);
    const connectSocket = () => {
        socket.value = io(url);
    };

    const emitEvent = (eventName, data) => {
        if (socket.value) {
            socket.value.emit(eventName, data);
        }
    };

    const listenEvent = (eventName, callback) => {
        if (socket.value) {
            socket.value.on(eventName, callback);
        } else {
            console.error('Socket is not connected');
        }
    };

    onUnmounted(() => {
        if (socket.value) {
            socket.value.disconnect();
        }
    });

    connectSocket();

    return {
        emitEvent,
        listenEvent
    };
}
