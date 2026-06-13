import { create } from 'zustand';

interface MediaState {
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  localScreenTrack: MediaStreamTrack | null;
  remoteTracks: Record<string, MediaStreamTrack[]>;
  micOn: boolean;
  cameraOn: boolean;
  screenShareOn: boolean;
  selectedAudioInput: string | null;
  selectedVideoInput: string | null;
  selectedAudioOutput: string | null;
  
  setLocalAudioTrack: (track: MediaStreamTrack | null) => void;
  setLocalVideoTrack: (track: MediaStreamTrack | null) => void;
  setLocalScreenTrack: (track: MediaStreamTrack | null) => void;
  addRemoteTrack: (participantId: string, track: MediaStreamTrack) => void;
  removeRemoteTracks: (participantId: string) => void;
  setMicOn: (isOn: boolean) => void;
  setCameraOn: (isOn: boolean) => void;
  setScreenShareOn: (isOn: boolean) => void;
  setSelectedDevices: (devices: { audioInput?: string, videoInput?: string, audioOutput?: string }) => void;
  clearMedia: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  localAudioTrack: null,
  localVideoTrack: null,
  localScreenTrack: null,
  remoteTracks: {},
  micOn: true,
  cameraOn: true,
  screenShareOn: false,
  selectedAudioInput: null,
  selectedVideoInput: null,
  selectedAudioOutput: null,

  setLocalAudioTrack: (track) => set({ localAudioTrack: track }),
  setLocalVideoTrack: (track) => set({ localVideoTrack: track }),
  setLocalScreenTrack: (track) => set({ localScreenTrack: track }),
  
  addRemoteTrack: (participantId, track) => set((state) => {
    const participantTracks = state.remoteTracks[participantId] || [];
    return {
      remoteTracks: {
        ...state.remoteTracks,
        [participantId]: [...participantTracks.filter(t => t.kind !== track.kind), track],
      }
    };
  }),
  
  removeRemoteTracks: (participantId) => set((state) => {
    const newRemoteTracks = { ...state.remoteTracks };
    delete newRemoteTracks[participantId];
    return { remoteTracks: newRemoteTracks };
  }),
  
  setMicOn: (isOn) => set({ micOn: isOn }),
  setCameraOn: (isOn) => set({ cameraOn: isOn }),
  setScreenShareOn: (isOn) => set({ screenShareOn: isOn }),
  
  setSelectedDevices: (devices) => set((state) => ({ ...state, ...devices })),
  
  clearMedia: () => set({
    localAudioTrack: null,
    localVideoTrack: null,
    localScreenTrack: null,
    remoteTracks: {},
    micOn: true,
    cameraOn: true,
    screenShareOn: false,
  }),
}));
