// playlistCreatedEvent.js

import { DeviceEventEmitter } from "react-native";

// Función para emitir el evento cuando una nueva playlist es creada
export const emitPlaylistCreatedEvent = () => {
    DeviceEventEmitter.emit("playlistCreated");
};

// Función para suscribirse al evento de creación de playlist
export const subscribeToPlaylistCreatedEvent = (callback) => {
    return DeviceEventEmitter.addListener("playlistCreated", callback);
};

// Función para eliminar el listener del evento de creación de playlist
export const unsubscribeFromPlaylistCreatedEvent = (listener) => {
    listener.remove();
};
