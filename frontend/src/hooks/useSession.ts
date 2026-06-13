import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSocket } from '../services/socket';
import { useSessionStore } from '../stores/sessionStore';
import { useMediaStore } from '../stores/mediaStore';
import { SOCKET_EVENTS, ROUTES } from '../utils/constants';

export const useSession = (sessionId: string) => {
  const socket = getSocket();
  const navigate = useNavigate();
  const { currentSession, participants, addParticipant, removeParticipant, updateParticipant, setIsRecording, clearSession } = useSessionStore();
  const { setMicOn, setCameraOn, setScreenShareOn } = useMediaStore();

  useEffect(() => {
    if (sessionId) {
      socket.emit(SOCKET_EVENTS.JOIN_SESSION, { sessionId }, (response: any) => {
        if (response.error) {
          toast.error(response.error);
          navigate(ROUTES.DASHBOARD);
        }
      });
    }

    socket.on(SOCKET_EVENTS.PARTICIPANT_JOINED, (participant) => {
      addParticipant(participant);
      toast.success(`${participant.name} joined`);
    });

    socket.on(SOCKET_EVENTS.PARTICIPANT_LEFT, ({ participantId, name }) => {
      removeParticipant(participantId);
      toast(`${name} left`, { icon: '👋' });
    });

    socket.on(SOCKET_EVENTS.PARTICIPANT_UPDATED, (participant) => {
      updateParticipant(participant.id, participant);
    });

    socket.on(SOCKET_EVENTS.SESSION_ENDED, () => {
      toast('Session ended by host', { icon: '🛑' });
      clearSession();
      navigate(ROUTES.DASHBOARD);
    });

    socket.on(SOCKET_EVENTS.RECORDING_STARTED, () => {
      setIsRecording(true);
      toast.success('Recording started');
    });

    socket.on(SOCKET_EVENTS.RECORDING_STOPPED, () => {
      setIsRecording(false);
      toast.success('Recording stopped');
    });

    return () => {
      if (sessionId) {
        socket.emit(SOCKET_EVENTS.LEAVE_SESSION, { sessionId });
      }
      socket.off(SOCKET_EVENTS.PARTICIPANT_JOINED);
      socket.off(SOCKET_EVENTS.PARTICIPANT_LEFT);
      socket.off(SOCKET_EVENTS.PARTICIPANT_UPDATED);
      socket.off(SOCKET_EVENTS.SESSION_ENDED);
      socket.off(SOCKET_EVENTS.RECORDING_STARTED);
      socket.off(SOCKET_EVENTS.RECORDING_STOPPED);
    };
  }, [socket, sessionId, navigate, addParticipant, removeParticipant, updateParticipant, setIsRecording, clearSession]);

  const endSession = () => {
    socket.emit(SOCKET_EVENTS.SESSION_ENDED, { sessionId });
    clearSession();
    navigate(ROUTES.DASHBOARD);
  };

  const leaveSession = () => {
    clearSession();
    navigate(ROUTES.DASHBOARD);
  };

  return {
    currentSession,
    participants,
    endSession,
    leaveSession
  };
};
