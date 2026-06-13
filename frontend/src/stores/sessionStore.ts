import { create } from 'zustand';
import { Session, Participant } from '../types';

interface SessionState {
  currentSession: Session | null;
  sessions: Session[];
  participants: Participant[];
  isRecording: boolean;
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  setIsRecording: (isRecording: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  sessions: [],
  participants: [],
  isRecording: false,
  setCurrentSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) => set({ sessions }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) => set((state) => ({ 
    participants: [...state.participants.filter(p => p.id !== participant.id), participant] 
  })),
  removeParticipant: (participantId) => set((state) => ({ 
    participants: state.participants.filter(p => p.id !== participantId) 
  })),
  updateParticipant: (participantId, updates) => set((state) => ({
    participants: state.participants.map(p => p.id === participantId ? { ...p, ...updates } : p)
  })),
  setIsRecording: (isRecording) => set({ isRecording }),
  clearSession: () => set({ currentSession: null, participants: [], isRecording: false }),
}));
