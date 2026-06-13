import { useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useChatStore } from '../stores/chatStore';
import { SOCKET_EVENTS } from '../utils/constants';
import { MessageType } from '../types';

export const useChat = (sessionId: string) => {
  const socket = getSocket();
  const { messages, addMessage, clearMessages } = useChatStore();

  useEffect(() => {
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message) => {
      addMessage(message);
    });

    socket.on(SOCKET_EVENTS.FILE_SHARED, (fileData) => {
      addMessage({
        id: fileData.id,
        sessionId,
        senderId: fileData.senderId,
        senderName: fileData.senderName,
        type: MessageType.FILE,
        content: fileData.name,
        timestamp: new Date().toISOString(),
        fileUrl: fileData.url,
        fileName: fileData.name,
      });
    });

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE);
      socket.off(SOCKET_EVENTS.FILE_SHARED);
    };
  }, [socket, sessionId, addMessage]);

  const sendMessage = useCallback((content: string) => {
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, { sessionId, content, type: MessageType.TEXT });
  }, [socket, sessionId]);

  return {
    messages,
    sendMessage,
    clearMessages,
  };
};
