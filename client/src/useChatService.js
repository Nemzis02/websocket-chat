/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from 'react';
import { SOCKET_URL } from './constants';

const webSocketTypes = {
  CONNECTION: 'connection',
  NEW_MESSAGE: 'new_message',
};

let socket = new WebSocket(SOCKET_URL);

const useChatService = (user) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    (message) => socket.send(JSON.stringify({ userId: user.id, message })),
    [socket, user]
  );

  socket.onopen = () => {
    setIsConnected(true);
  };

  socket.onmessage = (e) => {
    const { type, payload } = JSON.parse(e.data);
    const { messages, newMessage } = payload;

    if (type === webSocketTypes.CONNECTION) {
      setMessages(messages);
    }

    if (type === webSocketTypes.NEW_MESSAGE) {
      setMessages((messages) => [...(messages || []), newMessage]);
    }
  };

  socket.onclose = (e) => {
    setIsConnected(false);
    setMessages(null);
    setError(null);
  };

  socket.onerror = (error) => {
    setError(error);
  };

  return { isConnected, messages, sendMessage, error };
};

export default useChatService;
