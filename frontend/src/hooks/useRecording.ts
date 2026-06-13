import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { recordingApi } from '../services/api';
import { useSessionStore } from '../stores/sessionStore';

export const useRecording = (sessionId: string) => {
  const { isRecording } = useSessionStore();

  const startMutation = useMutation({
    mutationFn: () => recordingApi.startRecording(sessionId),
    onSuccess: () => toast.success('Starting recording...'),
    onError: () => toast.error('Failed to start recording'),
  });

  const stopMutation = useMutation({
    mutationFn: () => recordingApi.stopRecording(sessionId),
    onSuccess: () => toast.success('Stopping recording...'),
    onError: () => toast.error('Failed to stop recording'),
  });

  const toggleRecording = () => {
    if (isRecording) {
      stopMutation.mutate();
    } else {
      startMutation.mutate();
    }
  };

  return {
    isRecording,
    toggleRecording,
    isPending: startMutation.isPending || stopMutation.isPending,
  };
};
