import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isOpen: boolean;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setIsOpen: (isOpen: boolean) => void;
  markRead: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  unreadCount: 0,
  isOpen: false,
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + 1,
  })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [], unreadCount: 0 }),
  setIsOpen: (isOpen) => set((state) => ({ 
    isOpen, 
    unreadCount: isOpen ? 0 : state.unreadCount 
  })),
  markRead: () => set({ unreadCount: 0 }),
}));
