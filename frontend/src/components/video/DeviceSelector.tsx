import React, { useEffect, useState } from 'react';
import { useMediaStore } from '../../stores/mediaStore';

export const DeviceSelector: React.FC = () => {
  const { selectedAudioInput, selectedVideoInput, selectedAudioOutput, setSelectedDevices } = useMediaStore();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(setDevices);
    navigator.mediaDevices.addEventListener('devicechange', () => {
      navigator.mediaDevices.enumerateDevices().then(setDevices);
    });
  }, []);

  const audioInputs = devices.filter(d => d.kind === 'audioinput');
  const videoInputs = devices.filter(d => d.kind === 'videoinput');
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Microphone</label>
        <select 
          value={selectedAudioInput || ''} 
          onChange={(e) => setSelectedDevices({ audioInput: e.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500"
        >
          {audioInputs.map(d => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 5)}`}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Camera</label>
        <select 
          value={selectedVideoInput || ''} 
          onChange={(e) => setSelectedDevices({ videoInput: e.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500"
        >
          {videoInputs.map(d => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Speaker</label>
        <select 
          value={selectedAudioOutput || ''} 
          onChange={(e) => setSelectedDevices({ audioOutput: e.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500"
        >
          {audioOutputs.map(d => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0, 5)}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
