import { useEffect, useState } from 'react';
import { initSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

export const useSocket = (inviteToken?: string) => {
  const { token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (token || inviteToken) {
      const s = initSocket(token || undefined, inviteToken);
      setSocket(s);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      s.on('connect', onConnect);
      s.on('disconnect', onDisconnect);

      if (s.connected) {
        setIsConnected(true);
      }

      return () => {
        s.off('connect', onConnect);
        s.off('disconnect', onDisconnect);
      };
    }
  }, [token, inviteToken]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return { socket, isConnected };
};
